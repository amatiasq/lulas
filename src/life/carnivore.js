define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');
	var cell = require('life/cell');

	var carnivore = type(cell, {

		$type: 'CARNIVORE',

		baseColor: {
			r: 0,
			g: 255,
			b: NaN,
		},

		_isFood: function(target) {
			return cell.isPrototypeOf(target);
		}
	});

	memory.add(pool(carnivore));
	return carnivore;
});
