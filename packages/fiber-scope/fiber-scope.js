import { DDP } from 'meteor/ddp-client'

var _fs = function FiberScope() {};
const Fiber = require("fibers");

const FIBER_SCOPE_NAMESPACE = "convexset:fiber-scope";
function fiberCheck() {
	if (!Fiber.current) {
		throw new Meteor.Error('not-in-a-fiber', 'FiberScope functionality only available within a Fiber. (e.g.: within Meteor Method invocations and publication functions.)');
	}
}

const FiberScope = new _fs();
Object.defineProperties(FiberScope, {
	context: {
		configurable: false,
		enumerable: true,
		get: function getContext() {
			fiberCheck();
			return DDP._CurrentInvocation.getOrNullIfOutsideFiber();
		}
	},
	currentScope: {
		configurable: false,
		enumerable: true,
		get: function getFiberScope() {
			fiberCheck();
			var currentScope = Fiber.current[FIBER_SCOPE_NAMESPACE] || {};
			Fiber.current[FIBER_SCOPE_NAMESPACE] = currentScope;
			return currentScope;
		}
	}
});

export { FiberScope };