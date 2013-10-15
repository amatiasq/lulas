define(function(require) {
	'use strict';

	var type = require('core/type');
	var vector = require('physics/vector');

	function fixStrength(force) {
		if (force._strength < 0) {
			force._direction.multiply(-1);
			force._strength *= -1;
		}
	}

	var force = type({

		$type: 'FORCE',

		get radians() {
			return this._direction.radians;
		},
		set radians(value) {
			this._direction.radians = value;
		},
		get direction() {
			return this._direction.angle;
		},
		set direction(value) {
			this._direction = vector.fromAngle(value);
		},
		get strength() {
			return this._strength;
		},
		set strength(value) {
			this._strength = value;
			fixStrength(this);
		},
		get vector() {
			return this._direction.multiply(this._strength);
		},

		init: function(degrees, strength) {
			this.strength = strength || 0;
			this.direction = degrees || 0;
		},

		clone: function() {
			return force.new(this.direction, this.strength);
		},
		equal: function(other) {
			return this.radians === other.radians &&
				this.strength === other.strength;
		},
		merge: function(other) {
			var flow = this.vector;
			var force = other.vector;
			var result = flow.merge(force);
			this.radians = result.radians;
			this.strength = result.hypotenuse;
			return this;
		}
	});

	return force;
});
