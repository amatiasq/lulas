define(function(require) {
	'use strict';
	var extend = require('core/extend');
	var Cell = require('life/cell');
	var Plant = require('life/plant');

	var Herbivore;
	return Herbivore = extend(Object.create(Cell), {
		$type: 'HERBIVORE',

		baseColor: {
			r: 100,
			g: 255,
			b: NaN,
		},

		_isFood: function(target) {
			return Plant.isPrototypeOf(target);
		}
	});
});
