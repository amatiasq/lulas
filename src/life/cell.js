define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Animal = require('life/animal');

	function Cell(location, diameter, parents) {
		Animal.call(this, location, diameter, parents);
		this.factor['reproduce at size'] = 200;
		this.factor['mitosis split velocity'] = 5;
	}

	Cell.prototype = Object.create(Animal.prototype, descriptors({
		constructor: Cell,

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
				this.onReproduce([ child1, child2 ], this);

			this.die();
		},

		_createChild: function() {
			var Type = this.constructor;
			return new Type(this.location, this.radius * 0.9, [ this ]);
		}
	}));

	return Cell;
});
