define(function(require) {
	'use strict';
	var Vector = require('physics/vector');
	var id = 0;

	return {
		$type: 'MAP_ELEMENT',
		new: require('core/new'),

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
			return Math.PI * this.radius * this.radius;
		},

		init: function(location, diameter) {
			this.id = id++;
			this.factor = {};
			this.location = location || Vector.new(0, 0);
			this.diameter = diameter || 1;
		},

		dispose: function() {
			this.factor = null;
			this.location = null;
		},

		angle: function(target) {
			target = target.location || target;
			return target.diff(this.location).degrees;
		},

		distance: function(target) {
			target = target.location || target;
			return target.diff(this.location).magnitude;
		},

		testCollision: function(target) {
			return this.distance(target) < this.radius + target.radius;
		}
	};
});
