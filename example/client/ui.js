import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';

import './ui.html';

const nextTick = require("next-tick");


Template.FiberScopeDemo.onCreated(function() {
	var instance = this;
	instance.id = Random.id(6);
	instance.sub = null;
});

Template.FiberScopeDemo.helpers({
	id: () => Template.instance().id
});

Template.FiberScopeDemo.events({
	'click button#call-method': function() {
		var id = `${Template.instance().id}-${Random.id(4)}`;
		console.log("some-method", id);
		Meteor.call("some-method", id);
	},
	'click button#call-method-unblocked': function() {
		var id = `${Template.instance().id}-${Random.id(4)}`;
		console.log("some-method-unblocked", id);
		Meteor.call("some-method-unblocked", id);
	},
	'click button#call-method-set-timeout-defer-promise': function() {
		var id = `${Template.instance().id}-${Random.id(4)}`;
		console.log("some-method-set-timeout-defer-promise", id);
		Meteor.call("some-method-set-timeout-defer-promise", id);
	},
	'click button#call-method-set-interval': function() {
		var id = `${Template.instance().id}-${Random.id(4)}`;
		console.log("some-method-set-interval", id);
		Meteor.call("some-method-set-interval", id);
	},
	'click button#invoke-publish': function() {
		var id = `${Template.instance().id}-${Random.id(4)}`;
		var instance = Template.instance();
		if (!!instance.sub) {
			instance.sub.stop();
		}
		nextTick(function() {
			instance.sub = Meteor.subscribe("some-pub", id);
		});
	},
});