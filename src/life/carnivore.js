define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Cell = require('life/cell');
	var Herbivore = require('life/herbivore');

	function Carnivore(location, diameter, parents) {
		Cell.call(this, location, diameter, parents);
		this.factor['velocity'] = 2;
		this.factor['velocity max'] = 6 + Math.random();
	}

	Carnivore.prototype = Object.create(Cell.prototype, descriptors({
		constructor: Carnivore,

		baseColor: {
			r: 255,
			g: 0,
			b: NaN,
		},

		_isFood: function(target, alternative) {

			var that = this;
			function tmp(result) {
				if (window.DEBUG)
					console.log(that.id, target, alternative, result);
				return result;
			}

			if (target instanceof Herbivore)
				return tmp(true);

			if (alternative instanceof Herbivore)
				return tmp(false);

			return tmp(target instanceof Cell);
		}
	}));

	return Carnivore;
});
