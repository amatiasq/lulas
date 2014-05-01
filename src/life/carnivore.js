define(function(require) {
	'use strict';
	var extend = require('core/extend');
	var Cell = require('life/cell');

	var Carnivore;
	return Carnivore = extend(Object.create(Cell), {
		$type: 'CARNIVORE',

		baseColor: {
			r: 255,
			g: 0,
			b: NaN,
		},

		_isFood: function(target) {
			return Cell.isPrototypeOf(target);
		}
	});
});
