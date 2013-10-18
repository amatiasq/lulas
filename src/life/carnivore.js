define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');
	var cell = require('life/cell');

	var carnivore = type(cell, {

		$type: 'CARNIVORE',

		baseColor: {
			r: 255,
			g: 0,
			b: NaN,
		},

		_isFood: function(target) {
			return cell.isPrototypeOf(target);
		}
	});

	memory.add(pool(carnivore));
	return carnivore;
});
