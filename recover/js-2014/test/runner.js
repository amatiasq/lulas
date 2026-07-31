//jshint camelcase:false

'use strict';

if (!Function.prototype.bind) {
	Function.prototype.bind = function(scope) {
		var fn = this;
		var partial = Array.prototype.slice.call(arguments, 1);
		return function() {
			var args = partial.length ?
				partial.concat(Array.prototype.slice.call(arguments)) :
				arguments;

			return fn.apply(scope, args);
		};
	};
}

requirejs.config({
	baseUrl: '/base/src',
	urlArgs: Date.now(),

	paths: {
		'test': '../test',
		'sinon': '../lib/sinon-1.7.3',
		'injector': '../lib/injector',
		'chai': '../bower_components/chai/chai',
	},

	shim: {
		'sinon': {
			exports: 'sinon',
		}
	}
});

(function() {

	var files = Object.keys(window.__karma__.files);

	var deps = files.filter(function(filename) {
		return filename.indexOf('.test.js') !== -1;
	});

	requirejs(deps, function() {
		window.__karma__.start();
	});
})();
