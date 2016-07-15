import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FiberScope } from 'meteor/convexset:fiber-scope';

FiberScope._replaceMeteorTimerFunctions();

function showContext(prefix) {
	console.log(`[${prefix}|${FiberScope.current.id}]`, FiberScope.context || FiberScope.current.context);
}

function nextThing(prefix) {
	FiberScope.current.idx = (FiberScope.current.idx || 0) + 1;
	console.log(`[${prefix}|${FiberScope.current.id}]`, FiberScope.current.idx);
}

Meteor.publish('some-pub', function(id) {
	check(id, String);
	FiberScope.current.id = id;
	FiberScope.current.context = this;
	showContext("pub");
	Meteor._sleepForMs(2000);
	nextThing("pub");
	Meteor._sleepForMs(2000);
	nextThing("pub");
	Meteor._sleepForMs(2000);
	nextThing("pub");
	Meteor._sleepForMs(2000);
	return this.ready();
});

Meteor.methods({
	'some-method': function(id) {
		check(id, String);
		FiberScope.current.id = id;
		showContext("method");
		Meteor._sleepForMs(2000);
		nextThing("method");
		Meteor._sleepForMs(2000);
		nextThing("method");
		Meteor._sleepForMs(2000);
		nextThing("method");
		Meteor._sleepForMs(2000);
	},
	'some-method-unblocked': function(id) {
		check(id, String);
		this.unblock();
		FiberScope.current.id = id;
		showContext("method-unblocked");

		Meteor._sleepForMs(2000);
		nextThing("method-unblocked");
		Meteor._sleepForMs(2000);
		nextThing("method-unblocked");
		Meteor._sleepForMs(2000);
		nextThing("method-unblocked");
		Meteor._sleepForMs(2000);
	},
	"my-method": function(id) {
		this.unblock(); // enables yielding between calls from the same connection
		FiberScope.current.x = Math.random();
		FiberScope.current.y = Math.random();
		displayCoords(id);
		Meteor._sleepForMs(2000); // causes a yield (other code can run during this pause)
		displayCoords(id);
	},
	'some-method-set-timeout-defer-promise': function(id) {
		check(id, String);
		this.unblock();
		FiberScope.current.id = id;
		showContext("method-set-timeout-defer-promise");

		// Note that FiberScope._replaceMeteorTimerFunctions(); was called
		// and FiberScope.setTimeout and
		//     FiberScope.defer are being used
		Meteor.setTimeout(function() {
			console.log(`[setTimeout|current|${FiberScope.current.id}]`, FiberScope.current);
		}, 100);
		Meteor.defer(function() {
			console.log(`[defer|current|${FiberScope.current.id}]`, FiberScope.current);
		});

		(new Promise(function(resolve) {
			console.log(`[Promise-1|current|${FiberScope.current.id}]`, FiberScope.current);
			setTimeout(() => resolve(), 5000);
		})).then(function() {
			console.log(`[Promise-2|context|${FiberScope.current.id}]`, FiberScope.context);
			console.log(`[Promise-2|current|${FiberScope.current.id}]`, FiberScope.current);
		});
	},
	'some-method-set-interval': function(id) {
		check(id, String);
		FiberScope.current.id = id;
		showContext("method-set-timeout");
		FiberScope.current.countDown = 3;

		// Note that FiberScope._replaceMeteorTimerFunctions(); was called
		// and FiberScope.setInterval is being used
		var interval = Meteor.setInterval(function() {
			if (FiberScope.current.countDown === 3) {
				console.log('[setInterval|context]', FiberScope.context);
			}
			if (FiberScope.current.countDown === 0) {
				Meteor.clearInterval(interval);
			}
			console.log(`[setInterval|current|${FiberScope.current.countDown}]`, FiberScope.current);
			FiberScope.current.countDown -= 1;
		}, 1000);
	}
});

function displayCoords(id) {
	console.log(`[${id}] x=${FiberScope.current.x}, y=${FiberScope.current.y}`)
}