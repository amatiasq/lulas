define(function(require) {
	'use strict';

	var pool = require('core/pool');
	var type = require('core/type');
	var vector = require('physics/vector');

	var factor = pool(type({
		$type: 'ELEMENT_FACTORS',
		init: function() { },
	}));

	var id = 0;

	var element = type({

		$type: 'MAP_ELEMENT',

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
			this.isDisposed = false;
			this.id = id++;
			this.factor = factor.new();
			this.location = location || vector.zero;
			this.diameter = diameter || 1;
		},

		dispose: function() {
			if (this.isDisposed) debugger;
			this.isDisposed = true;
			this.factor.dispose();
			this.factor = null;
		},

		angle: function(target) {
			target = target.location || target;
			return target.diff(this.location).angle;
		},

		distance: function(target) {
			target = target.location || target;
			return target.diff(this.location).hypotenuse;
		},

		testCollision: function(target) {
			return this.distance(target) < this.radius + target.radius;
		}
	});

	return element;
});
