define(function() {
	'use strict';

	var Vector = {
		$type: 'VECTOR',
		_cache: {},
		created: 0,
		cached: 0,
		bad: 0,
		good: 0,
		none: 0,

		logDebugData: function() {
			var message;

			if (Vector.cached < Vector.created)
				message = 'bad';
			else if (Vector.cached > Vector.created)
				message = 'good';
			else
				message = 'none';

			Vector[message]++;
			console.log(Vector.good, Vector.bad, Vector.none, message, '(', Vector.cached, '-', Vector.created, ')');

			Vector.created = Vector.cached = 0;
		},

		new: function(x, y) {
			if (isNaN(x) || isNaN(y)) debugger;
			var decimals = 100;
			x = (x * decimals | 0) / decimals;
			y = (y * decimals | 0) / decimals;

			var key = x + '-' + y;

			if (!this._cache[key]) {
				this._cache[key] = Object.create(this).init(x, y);
				Vector.created++;
			} else {
				Vector.cached++;
			}

			return this._cache[key];
		},

		fromRadians: function(radians) {
			return Vector.new(Math.cos(radians), Math.sin(radians));
		},
		fromDegrees: function(degrees) {
			degrees = degrees % 360;

			if (degrees < 0)
				degrees += 360;

			return this.fromRadians(degrees * Math.PI / 180);
		},
		fromMagnitude: function(value) {
			return Vector.new(value, 0);
		},
		from: function(degrees, magnitude) {
			var vector = this.fromDegrees(degrees);
			return vector.setMagnitude(magnitude);
		},

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

		init: function(x, y) {
			this.x = x;
			this.y = y;
			this.isZero = x === 0 && y === 0;
			Object.freeze(this);
			return this;
		},

		setX: function(value) {
			return Vector.new(value, this.y);
		},
		setY: function(value) {
			return Vector.new(this.x, value);
		},
		setMagnitude: function(value) {
			if (this.isZero)
				return this.fromMagnitude(value);

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
			return Vector.new(this.x + x, this.y + y);
		},
		sustract: function(x, y) {
			if (arguments.length === 1) y = x;
			return Vector.new(this.x - x, this.y - y);
		},
		multiply: function(x, y) {
			if (arguments.length === 1) y = x;
			return Vector.new(this.x * x, this.y * y);
		},
		divide: function(x, y) {
			if (arguments.length === 1) y = x;
			return Vector.new(this.x / x, this.y / y);
		},

		merge: function(other) {
			return Vector.new(this.x + other.x, this.y + other.y);
		},
		diff: function(other) {
			return Vector.new(this.x - other.x, this.y - other.y);
		},

		round: function(decimals) {
			var operator = Math.pow(10, arguments.length ? decimals : 0);
			return Vector.new(
				(this.x * operator | 0) / operator,
				(this.y * operator | 0) / operator
			);
		},
		abs: function() {
			return Vector.new(Math.abs(this.x), Math.abs(this.y));
		},

		toString: function() {
			return '[Vector(' + this.x + ',' + this.y +')]';
		}
	};

	Vector.ZERO = Vector.new(0, 0);
	Vector.BIGGER = Vector.new(Infinity, Infinity);
	return Vector;
});
