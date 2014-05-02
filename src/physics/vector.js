define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');

	function Vector(x, y) {
		if (isNaN(x) || isNaN(y)) debugger;
		this.x = x;
		this.y = y;
		this.isZero = x === 0 && y === 0;
		//Object.freeze(this);
		return this;
	}

	Vector.prototype = {
		get radians() {
			if (this.isZero)
				return 0;

			var arctan = Math.atan(this.y / this.x);

			if (arctan < 0)
				arctan += Math.PI;

			if (this.y < 0 || (this.y === 0 && this.x < 0))
				arctan += Math.PI;

			return arctan;
		},
		get degrees() {
			var degrees = (this.radians / Math.PI * 180) % 360;
			return degrees < 0 ? degrees + 360 : degrees;
		},
		get magnitude() {
			if (this.isZero)
				return 0;

			return Math.sqrt(this.x * this.x + this.y * this.y, 2);
		},
	};

	Object.defineProperties(Vector.prototype, descriptors({
		constructor: Vector,

		setX: function(value) {
			return new Vector(value, this.y);
		},
		setY: function(value) {
			return new Vector(this.x, value);
		},
		setMagnitude: function(value) {
			if (this.isZero)
				return Vector.fromMagnitude(value);

			var operator = value / this.magnitude;
			return this.multiply(operator);
		},
		setRadians: function(value) {
			var vector = Vector.fromRadians(value);
			return vector.multiply(this.magnitude);
		},
		setDegrees: function(value) {
			var vector = Vector.fromDegrees(value);
			return vector.multiply(this.magnitude);
		},

		add: function(x, y) {
			if (arguments.length === 1) y = x;
			return new Vector(this.x + x, this.y + y);
		},
		sustract: function(x, y) {
			if (arguments.length === 1) y = x;
			return new Vector(this.x - x, this.y - y);
		},
		multiply: function(x, y) {
			if (arguments.length === 1) y = x;
			return new Vector(this.x * x, this.y * y);
		},
		divide: function(x, y) {
			if (arguments.length === 1) y = x;
			return new Vector(this.x / x, this.y / y);
		},

		merge: function(other) {
			return new Vector(this.x + other.x, this.y + other.y);
		},
		diff: function(other) {
			return new Vector(this.x - other.x, this.y - other.y);
		},

		round: function(decimals) {
			var operator = Math.pow(10, arguments.length ? decimals : 0);
			return new Vector(
				Math.round(this.x * operator) / operator,
				Math.round(this.y * operator) / operator
			);
		},
		abs: function() {
			return new Vector(Math.abs(this.x), Math.abs(this.y));
		},

		toString: function() {
			return '[Vector(' + this.x + ',' + this.y +')]';
		}
	}));

	Object.defineProperties(Vector, descriptors({
		ZERO: new Vector(0, 0),
		BIGGER: new Vector(Infinity, Infinity),

		fromRadians: function(radians) {
			return new Vector(Math.cos(radians), Math.sin(radians));
		},
		fromDegrees: function(degrees) {
			degrees = degrees % 360;

			if (degrees < 0)
				degrees += 360;

			return this.fromRadians(degrees * Math.PI / 180);
		},
		fromMagnitude: function(value) {
			return new Vector(value, 0);
		},
		from: function(degrees, magnitude) {
			var vector = this.fromDegrees(degrees);
			return vector.setMagnitude(magnitude);
		},
	}));


	return Vector;
});
