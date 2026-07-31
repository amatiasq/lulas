define(function(require) {
	'use strict';

	var assert = require('chai').assert;
	var vector = require('physics/vector');

	describe.skip('Having a vector type', function() {

		describe('when I invoke it', function() {
			it('should return an object assinging X and Y', function() {
				var sut = vector(1, 2);
				assert.equal(sut.x, 1);
				assert.equal(sut.y, 2);
			});
		});
	});
});
