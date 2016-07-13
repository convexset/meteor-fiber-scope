import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FiberScope } from 'meteor/convexset:fiber-scope';

function showContext(prefix) {
	console.log(`[${prefix}|${FiberScope.currentScope.id}]`, FiberScope.context || FiberScope.currentScope.context);
}

function nextThing(prefix) {
	FiberScope.currentScope.idx = (FiberScope.currentScope.idx || 0) + 1;
	console.log(`[${prefix}|${FiberScope.currentScope.id}]`, FiberScope.currentScope.idx);
}

Meteor.publish('some-pub', function(id) {
	check(id, String);
	FiberScope.currentScope.id = id;
	FiberScope.currentScope.context = this;
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
		FiberScope.currentScope.id = id;
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
		FiberScope.currentScope.id = id;
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
		FiberScope.currentScope.x = Math.random();
		FiberScope.currentScope.y = Math.random();
		displayCoords(id);
		Meteor._sleepForMs(2000); // causes a yield (other code can run during this pause)
		displayCoords(id);
	}
});

function displayCoords(id) {
	console.log(`[${id}] x=${FiberScope.currentScope.x}, y=${FiberScope.currentScope.y}`)
}