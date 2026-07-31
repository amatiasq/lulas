define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Life = require('life/life');

	function Plant(location, diameter, parents) {
			Life.call(this, location, diameter, parents);
			this.factor['weight'] = 1;
	}

	Plant.prototype = Object.create(Life.prototype, descriptors({
		constructor: Plant,

		baseColor: {
			r: 0,
			g: 100,
			b: NaN,
		},

		tick: function() {
			Life.prototype.tick.call(this);
			if (this.area < 100)
				this.diameter += 0.05;
		}
	}));

	return Plant;
});
