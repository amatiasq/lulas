define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Cell = require('life/cell');
	var Herbivore = require('life/herbivore');

	function Carnivore(location, diameter, parents) {
		Cell.call(this, location, diameter, parents);
		this.factor['velocity'] = 2;
		this.factor['velocity max'] = 8;
	}

	Carnivore.prototype = Object.create(Cell.prototype, descriptors({
		constructor: Carnivore,

		baseColor: {
			r: 255,
			g: 0,
			b: NaN,
		},

		_isFood: function(target) {
			return target instanceof Herbivore;
		}
	}));

	return Carnivore;
});
