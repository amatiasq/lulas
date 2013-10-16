define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');

	require('life/life');
	var life = memory.resource('LIFE');

	var plant = type(life, {

		$type: 'PLANT',

		tick: function() {
			life.tick.call(this);

			if (this.area < 100)
				this.radius += 0.05;
		}
	});

	memory.add(pool.new(plant));
	return plant;
});
