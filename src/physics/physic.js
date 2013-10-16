define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');
	var element = require('map/element');

	require('physics/force');
	var force = memory.resource('FORCE');


	var physic = type(element, {

		$type: 'PHYSIC',

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
			element.init.call(this, location, diameter);
			this.movement = force.new();
			//this.weight = 0;
		},

		dispose: function() {
			this.movement.dispose();
			this.movement = null;
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
		},

		tick: function() {
			this.move();
		}
	});

	memory.add(pool.new(physic));
	return physic;
});
