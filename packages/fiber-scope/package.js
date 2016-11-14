Package.describe({
	// [validatis:stack]
	name: 'convexset:fiber-scope',
	version: '0.1.2',
	summary: 'Super easy fibers-based dynamic scoping in Meteor Methods and Publications',
	git: 'https://github.com/convexset/meteor-fiber-scope',
	documentation: '../../README.md'
});


Package.onUse(function setup(api) {
	api.versionsFrom('1.3.1');
	api.use(['ecmascript', 'ejson', 'ddp'], 'server');
	api.use('tmeasday:check-npm-versions@0.3.1', 'server');
	api.mainModule('fiber-scope.js', 'server');
});
