define(function(require) {
	'use strict';

	var assert = require('chai').assert;
	var extend = require('core/extend');

	describe('Extend logic', function() {

		var target;
		beforeEach(function() {
			target = {};
		});

		it('should inject properties from it\'s second argument to the first', function() {
			var value = {};
			extend(target, { a: value });
			assert.equal(target.a, value, 'property is not copied');
		});

		it('should copy even properties with accessors without invoking it', function() {
			var flag = false;
			extend(target, {
				get a() {
					flag = true;
					return null;
				}
			});

			assert(!flag, 'extend invoked the accessor');

// Expected an assignment or function cal instad saw an expression
//jshint -W030
			target.a;

			assert(flag, 'target has not invoked the accessor');
		});

		it('should return target', function() {
			var result = extend(target, {});
			assert.equal(target, result, 'result value is not target');
		});
	});
});
