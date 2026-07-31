//jshint sub:true

define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Vector = require('physics/vector');

	function Physic() {
		this.movement = new Vector(0, 0);
		this.factor['weight'] = 0;
	}

	Physic.prototype = {

		get direction() {
			return this.movement.degrees;
		},
		set direction(value) {
			this.movement = this.movement.setDegrees(value);
		},
		get velocity() {
			return this.movement.magnitude;
		},
		set velocity(value) {
			this.movement = this.movement.setMagnitude(value);
		},

		get isStopped() {
			return Math.round(this.velocity * 10) === 0;
		},
		get isMoving() {
			return !this.isStopped;
		},
	};

	Object.defineProperties(Physic.prototype, descriptors({
		constructor: Physic,

		dispose: function() {
			this.movement = null;
		},

		// abstract
		move: function() { },

		shove: function(degrees, strength) {
			var effect = degrees instanceof Vector ?
				degrees :
				Vector.from(degrees, strength);

			var magnitude = effect.magnitude * (1 - this.factor['weight']);
			effect = effect.setMagnitude(magnitude);
			this.movement = this.movement.merge(effect);
		},

		accelerate: function(cuantity) {
			this.velocity += cuantity;
		},

		brake: function(cuantity) {
			var velocity = this.velocity - cuantity;
			if (velocity < 0) velocity = 0;
			this.velocity = velocity;
		},

		stop: function() {
			this.velocity = 0;
		},
	}));

	return Physic;
});
