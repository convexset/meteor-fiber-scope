import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FiberScope } from 'meteor/convexset:fiber-scope';

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
	}
});

function displayCoords(id) {
	console.log(`[${id}] x=${FiberScope.current.x}, y=${FiberScope.current.y}`)
}