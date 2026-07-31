define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Cell = require('life/cell');
	var Plant = require('life/plant');

	function Herbivore(location, diameter, parents) {
		Cell.call(this, location, diameter, parents);
	}

	Herbivore.prototype = Object.create(Cell.prototype, descriptors({
		constructor: Herbivore,

		baseColor: {
			r: 100,
			g: 255,
			b: NaN,
		},

		_isFood: function(target) {
			return target instanceof Plant;
		}
	}));

	return Herbivore;
});
