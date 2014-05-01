define(function(require) {
	'use strict';
	var extend = require('core/extend');
	var Animal = require('life/animal');

	var Cell;
	return Cell = extend(Object.create(Animal), {
		$type: 'CELL',

		init: function(location, diameter, parents) {
			Animal.init.call(this, location, diameter, parents);
			this.factor['reproduce at size'] = 200;
			this.factor['mitosis split velocity'] = 5;
		},

		canReproduce: function() {
			return this.area > this.factor['reproduce at size'];
		},

		reproduce: function() {
			var child1 = this._createChild();
			var child2 = this._createChild();
			var direction = Math.round(Math.random() * 360);
			var strength = this.factor['mitosis split velocity'];

			child1.shove(direction, strength);
			child2.shove(direction + 180, strength);

			if (this.onReproduce)
				this.onReproduce([ child1, child2 ]);

			this.die();
		},

		_createChild: function() {
			var Type = Object.getPrototypeOf(this);
			return Type.new(this.location, this.radius, [ this ]);
		}
	});
});
