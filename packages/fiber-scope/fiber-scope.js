import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';

var _fs = function FiberScope() {};
const Fiber = require("fibers");

const FIBER_SCOPE_NAMESPACE = "convexset:fiber-scope";
function fiberCheck() {
	if (!Fiber.current) {
		throw new Meteor.Error('not-in-a-fiber', 'FiberScope functionality only available within a Fiber. (e.g.: within Meteor Method invocations and publication functions.)');
	}
}

var fiberScopeEnvVar_Scope = new Meteor.EnvironmentVariable();
var fiberScopeEnvVar_Context = new Meteor.EnvironmentVariable();

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
			var currentScope = fiberScopeEnvVar_Scope.get() || Fiber.current[FIBER_SCOPE_NAMESPACE] || {};
			Fiber.current[FIBER_SCOPE_NAMESPACE] = currentScope;
			return currentScope;
		}
	},
	setTimeout: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_setTimeout(f, timeout) {
			return fiberScopeEnvVar_Scope.withValue(FiberScope.current, function() {
				return fiberScopeEnvVar_Context.withValue(FiberScope.context, function() {
					return MeteorTimerFunctions.setTimeout.call(Meteor, f, timeout);
				});
			});
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
			return fiberScopeEnvVar_Scope.withValue(FiberScope.current, function() {
				return fiberScopeEnvVar_Context.withValue(FiberScope.context, function() {
					return MeteorTimerFunctions.setInterval.call(Meteor, f, timeout);
				});
			});
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
			return fiberScopeEnvVar_Scope.withValue(FiberScope.current, function() {
				return fiberScopeEnvVar_Context.withValue(FiberScope.context, function() {
					return MeteorTimerFunctions.defer.call(Meteor, f);
				});
			});
		}
	},
	bindEnvironment: {
		configurable: false,
		enumerable: false,
		writable: false,
		value: function FiberScope_bindEnvironment(func, onException, _this) {
			return fiberScopeEnvVar_Scope.withValue(FiberScope.current, function() {
				return fiberScopeEnvVar_Context.withValue(FiberScope.context, function() {
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