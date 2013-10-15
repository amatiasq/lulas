define(function(require) {
	'use strict';

	var type = require('core/type');

	function overload(method) {
		return function(x, y) {
			return method.call(this, x, arguments.length === 1 ? x : y);
		};
	}

	var internal = type({

		$type: 'VECTOR',

		get x() {
			return this._x;
		},
		get y() {
			return this._y;
		},
		get isZero() {
			return this.x === 0 && this.y === 0;
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
		get angle() {
			var angle = this.radians / Math.PI * 180;

			while (angle < 0)
				angle += 360;

			return angle % 360;
		},
		get hypotenuse() {
			if (this.isZero)
				return 0;
			return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2), 2);
		},

		init: function vector(x, y) {
			this._x = x;
			this._y = y;
		},

		setX: function(x) {
			return vector(x, this._y);
		},
		setY: function(y) {
			return vector(this._x, y);
		},

		add: overload(function(x, y) {
			return vector(this.x + x, this.y + y);
		}),
		sustract: overload(function(x, y) {
			return vector(this.x - x, this.y - y);
		}),
		multiply: overload(function(x, y) {
			return vector(this.x * x, this.y * y);
		}),
		divide: overload(function(x, y) {
			return vector(this.x / x, this.y / y);
		}),

		equal: function(other) {
			return this.x === other.x && this.y === other.y;
		},

		merge: function(other) {
			return vector(this.x + other.x, this.y + other.y);
		},
		diff: function(other) {
			return vector(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
		},

		round: function(decimals) {
			var operator = Math.pow(10, arguments.length ? decimals : 0);
			return vector(
				Math.round(this.x * operator) / operator,
				Math.round(this.y * operator) / operator
			);
		},
		abs: function() {
			return vector(Math.abs(this.x), Math.abs(this.y));
		},

		toString: function() {
			return '[object Vector(x:' + this.x + ',y:' + this.y +')]';
		}
	});


	var cache = {};

	function vector(x, y) {
		var key = x + '-' + y;
		if (!cache[key])
			cache[key] = internal.new(x, y);

		return cache[key];
	}

	vector.zero = vector(0, 0);

	vector.fromRadians = function(radians) {
		return vector(Math.cos(radians), Math.sin(radians));
	};

	vector.fromAngle = function(angle) {
		angle = angle % 360;

		if (angle < 0)
			angle += 360;

		return this.fromRadians(angle * Math.PI / 180);
	};

	return vector;
});
