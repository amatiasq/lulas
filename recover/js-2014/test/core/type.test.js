define(function(require) {
	'use strict';

	var assert = require('chai').assert;
	var type = require('core/type');

	describe.skip('Type function', function() {

		describe('when it recives one argument', function() {
			it('should return a constructor for the passed object', function() {
				var target = {};
				var Ctor = type(target);
				assert(Ctor instanceof Function, 'Returned object is not a function');
				assert.equal(Ctor.prototype, target, 'Returned function\'s prototype is not passed object');
			});

			it('should use object\'s constructor property if provided', function() {
				function constructor() { }
				var target = {
					constructor: constructor
				};
				var Ctor = type(target);
				assert.equal(Ctor, constructor, 'Returned object is not constructor property');
				assert.equal(Ctor.prototype, target, 'Returned function\'s prototype is not passed object');
			});
		});

		describe('when it recives two arguments', function() {
			it('shold protototype the first argument and extend the result with the properties of the second one', function() {
				var parent = {};
				var config = { a: 1 };
				var result = type(parent, config).prototype;
				assert(parent.isPrototypeOf(result), 'parent is not prototyped');
				assert.equal(result.a, config.a, 'properties are not copied');
			});
		});
	});
});
