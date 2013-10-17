define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');
	var cell = require('life/cell');
	var plant = require('life/plant');

	var herbivore = type(cell, {

		$type: 'HERBIVORE',

		baseColor: {
			r: 100,
			g: 255,
			b: NaN,
		},

		_isFood: function(target) {
			return plant.isPrototypeOf(target);
		}
	});

	memory.add(pool(herbivore));
	return herbivore;
});
