define(function(require) {
	'use strict';
	var extend = require('core/extend');
	var Life = require('life/life');

	return extend(Object.create(Life), {
		$type: 'PLANT',

		baseColor: {
			r: 0,
			g: 100,
			b: NaN,
		},

		tick: function() {
			Life.tick.call(this);
			if (this.area < 100)
				this.diameter += 0.05;
		}
	});
});
