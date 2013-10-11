define(function(require) {
	'use strict';

	var type = require('core/type');
	var force = require('physics/force');
	var element = require('map/element');

	var physic = type(element, {

		get direction() {
			return this.movement.direction;
		},
		set direction(value) {
			this.movement.direction = value;
		},
		get velocity() {
			return this.movement.stength;
		},
		set velocity(value) {
			this.movement.strength = value;
		},

		get isStopped() {
			return Math.round(this.velocity * 10) === 0;
		},
		get isMoving() {
			return !this.isStopped;
		},

		init: function(location, diameter) {
			element.init.apply(this, location, diameter);
			this.movement = force.new();
			//this.weight = 0;
		},

		move: function() {
			this.location = this.location.merge(this.movement.vector);
		},

		shove: function(degrees, strength) {
			var effect = force.isPrototypeOf(degrees) ?
				degrees :
				force.new(degrees, strength);

			effect.strength *= 1 - this.weight;
			this.movement.merge(effect);
		},

		accelerate: function(cuantity) {
			this.velocity += cuantity;
		},

		brake: function(cuantity) {
			var velocity = this.velocity - cuantity;
			if (velocity < 0)
				velocity = 0;
			this.velocity = velocity;
		},

		stop: function() {
			this.velocity = 0;
		}
	});

	return physic;
});
