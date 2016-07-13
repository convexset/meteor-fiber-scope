# FiberScope

A package for providing ultra-simple dynamic scoping capabilities in Meteor methods and publication functions.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Usage](#usage)
  - [`FiberScope.current`](#fiberscopecurrent)
  - [`FiberScope.context`](#fiberscopecontext)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

This is available as [`convexset:fiber-scope`](https://atmospherejs.com/convexset/fiber-scope) on [Atmosphere](https://atmospherejs.com/). (Install with `meteor add convexset:fiber-scope`.)


## Usage

`FiberScope` is only available on the server. Begin with:
```javascript
import { FiberScope } from 'meteor/convexset:fiber-scope';
```

### `FiberScope.current`

The main tool of this package is a simple way to do dynamic scoping within a Meteor Method or publication function call using
```javascript
FiberScope.current
```
Each method method invocation will have easy access to its own private scope no matter how deep one wanders into the call stack and whether or not the method "yields".

For example:
```javascript
Meteor.methods({
  "my-method": function(id) {
    this.unblock();  // enables yielding between calls from the same connection
    FiberScope.current.x = Math.random();
    FiberScope.current.y = Math.random();
    display(id);
    Meteor._sleepForMs(1000);  // causes a yield (other code can run during this pause)
    display(id);
  }
});

function display(id) {
  console.log(`[${id}] x=${FiberScope.current.x}, y=${FiberScope.current.y}`)
}
```
Doing `Meteor.call("my-method", 'one'); Meteor.call("my-method", 'two');` will predictably generate something like:
```
one x=0.234, y=0.423
two x=0.345, y=0.594
one x=0.234, y=0.423
two x=0.345, y=0.594
```
on the server console.

### `FiberScope.context`

In Meteor methods, the context (`this`) provides a lot of information, but it becomes inconvenient to access when calling functions in a "nested manner". With `FiberScope` that inconvenience goes away as one can access and manipulate the Meteor method context directly as:
```javascript
FiberScope.context
```
For example:
 - `FiberScope.context.userId` returns the id of the currently logged in user
 - `FiberScope.context.connection.id` returns the id of the current connection

Note that for publication functions, similar functionality is not as readily available. One might consider (as in the provided example app) copying it as a property of `FiberScope.current` and using at later.

Here is an example of a Meteor Method context (the `this` when a Meteor method is called):
```javascript
{
    isSimulation: false,
    _unblock: [Function],
    _calledUnblock: false,
    userId: 'dwtnMSyxqxi32yGKC',
    _setUserId: [Function],
    connection: {
        id: 'iE7w8mcJ2RGHATCLi',
        close: [Function],
        onClose: [Function],
        clientAddress: '127.0.0.1',
        httpHeaders: {
            'x-forwarded-for': '127.0.0.1',
            host: 'localhost:7123',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
            'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6'
        }
    },
    randomSeed: null,
    randomStream: null
}
```
But then again, maybe one need only care about this subset:
```javascript
{
    userId: 'dwtnMSyxqxi32yGKC',
    connection: {
        id: 'iE7w8mcJ2RGHATCLi',
        clientAddress: '127.0.0.1',
        httpHeaders: {
            'x-forwarded-for': '127.0.0.1',
            host: 'localhost:7123',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
            'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6'
        }
    }
}
```