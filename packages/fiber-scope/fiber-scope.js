import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
	'package-utils': '^0.2.1',
	'underscore': '^1.8.3'
}); // package name can be omitted
const PackageUtilities = require('package-utils');
const _ = require('underscore');


const _fs = function FiberScope() {};
const Fiber = require('fibers');

const FIBER_SCOPE_NAMESPACE = 'convexset:fiber-scope';
function fiberCheck() {
	if (!Fiber.current) {
		throw new Meteor.Error('not-in-a-fiber', 'FiberScope functionality only available within a Fiber. (e.g.: within Meteor Method invocations and publication functions.)');
	}
}

/* eslint-disable camelcase */

const fiberScopeEnvVar_Scope = new Meteor.EnvironmentVariable();
const fiberScopeEnvVar_Context = new Meteor.EnvironmentVariable();

const MeteorTimerFunctions = {
	setTimeout: Meteor.setTimeout,
	setInterval: Meteor.setInterval,
	defer: Meteor.defer,
};

const FiberScope = new _fs();
Object.defineProperties(FiberScope, {
	context: {
		configurable: false,
		enumerable: true,
		get: function getContext() {
			fiberCheck();
			return fiberScopeEnvVar_Context.get() || DDP._CurrentInvocation.getOrNullIfOutsideFiber();
		}
	},
	current: {
		configurable: false,
		enumerable: true,
		get: function getFiberScope() {
			fiberCheck();
			const currentScope = fiberScopeEnvVar_Scope.get() || Fiber.current[FIBER_SCOPE_NAMESPACE] || {};
			Fiber.current[FIBER_SCOPE_NAMESPACE] = currentScope;
			return currentScope;
		}
	},
	setTimeout: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_setTimeout(f, timeout) {
			return MeteorTimerFunctions.setTimeout.call(Meteor, FiberScope.bindCopiedEnvironment(f), timeout);
		}
	},
	setTimeout_refType: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_setTimeout_refType(f, timeout) {
			return MeteorTimerFunctions.setTimeout.call(Meteor, FiberScope.bindEnvironment(f), timeout);
		}
	},
	clearTimeout: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_clearTimeout(timer) {
			Meteor.clearTimeout(timer);
		}
	},
	setInterval: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_setInterval(f, timeout) {
			return MeteorTimerFunctions.setInterval.call(Meteor, FiberScope.bindCopiedEnvironment(f), timeout);
		}
	},
	setInterval_refType: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_setInterval_refType(f, timeout) {
			return MeteorTimerFunctions.setInterval.call(Meteor, FiberScope.bindEnvironment(f), timeout);
		}
	},
	clearInterval: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_clearInterval(timer) {
			Meteor.clearInterval(timer);
		}
	},
	defer: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_defer(f) {
			return MeteorTimerFunctions.defer.call(Meteor, FiberScope.bindCopiedEnvironment(f));
		}
	},
	defer_refType: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_defer_refType(f) {
			return MeteorTimerFunctions.defer.call(Meteor, FiberScope.bindEnvironment(f));
		}
	},
	bindEnvironment: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_bindEnvironment(func, onException, _this) {
			return fiberScopeEnvVar_Scope.withValue(FiberScope.current, () => {
				return fiberScopeEnvVar_Context.withValue(FiberScope.context, () => {
					return Meteor.bindEnvironment(func, onException, _this);
				});
			});
		}
	},
	bindCopiedEnvironment: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_bindCopiedEnvironment(func, onException, _this) {
			return fiberScopeEnvVar_Scope.withValue(PackageUtilities.deepCopy(FiberScope.current), () => {
				return fiberScopeEnvVar_Context.withValue(_.extend({}, FiberScope.context), () => {
					return Meteor.bindEnvironment(func, onException, _this);
				});
			});
		}
	},
	_replaceMeteorTimerFunctions: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function _replaceMeteorTimerFunctions() {
			Meteor.setTimeout = FiberScope.setTimeout;
			Meteor.setInterval = FiberScope.setInterval;
			Meteor.defer = FiberScope.defer;
		}
	},
	_replaceMeteorTimerFunctions_refType: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function _replaceMeteorTimerFunctions_refType() {
			Meteor.setTimeout = FiberScope.setTimeout_refType;
			Meteor.setInterval = FiberScope.setInterval_refType;
			Meteor.defer = FiberScope.defer_refType;
		}
	},
	_restoreMeteorTimerFunctions: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function _restoreMeteorTimerFunctions() {
			Meteor.setTimeout = MeteorTimerFunctions.setTimeout;
			Meteor.setInterval = MeteorTimerFunctions.setInterval;
			Meteor.defer = MeteorTimerFunctions.defer;
		}
	}
});

export { FiberScope };
