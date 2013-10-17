define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');
	var life = require('life/life');

	var plant = type(life, {

		$type: 'PLANT',

		baseColor: {
			r: 0,
			g: 100,
			b: NaN,
		},

		tick: function() {
			life.tick.call(this);
			if (this.area < 100)
				this.diameter += 0.05;
		}
	});

	memory.add(pool(plant));
	return plant;
});
