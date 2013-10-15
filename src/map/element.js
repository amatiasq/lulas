define(function(require) {
	'use strict';

	var type = require('core/type');
	var vector = require('physics/vector');

	var element = type({

		$type: 'ELEMENT',

		get x() {
			return this.location.x;
		},
		set x(value) {
			this.location = this.location.setX(value);
		},
		get y() {
			return this.location.y;
		},
		set y(value) {
			this.location = this.location.setY(value);
		},

		get startX() {
			return this.location.x - this.radius;
		},
		get startY() {
			return this.location.y - this.radius;
		},
		get endX() {
			return this.location.x - this.radius;
		},
		get endY() {
			return this.location.y - this.radius;
		},

		get diameter() {
			return this.radius * 2;
		},
		set diameter(value) {
			this.radius = value / 2;
		},
		get area() {
			return Math.PI * Math.pow(this.radius, 2);
		},

		init: function(location, diameter) {
			this.location = location || vector.zero;
			this.diameter = diameter || 1;
		},

		angle: function(target) {
			target = target.location || target;
			return this.location.diff(target).angle;
		},

		distance: function(target) {
			target = target.location || target;
			return this.location.diff(target).hypotenuse;
		},

		testCollision: function(target) {
			return this.distance(target) < this.radius + target.radius;
		}
	});

	return element;
});
