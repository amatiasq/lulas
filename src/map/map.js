//jshint unused:false

define(function(require) {
	'use strict';
	var Vector = require('physics/vector');

	return {
		$type: 'MAP',
		new: require('core/new'),

		get width() {
			return this._width;
		},
		set width(value) {
			this._width = value;
			this.halfWidth = value / 2;
		},
		get height() {
			return this._height;
		},
		set height(value) {
			this._height = value;
			this.halfHeight = value / 2;
		},

		init: function() {
			this.width = 100;
			this.height = 100;
			this.cellSize = 10;
		},

		getEntitiesAt: function(from, radius) {
			var entities = [];
			var target, diff;

			for (var i = this.entities.length; i--;) {
				target = this.entities[i];
				if (target.isDisposed) continue;

				diff = from.diff(target.location);
				if (diff.x <= radius && diff.y <= radius)
					entities.push(target);
			}

			return entities;
		},

		getShorterDistance: function(from, to) {
			var diff = to.diff(from);
			return Vector.new(
				diff.x < this.halfWidth ? diff.x : this.width - diff.x,
				diff.y < this.halfHeight ? diff.y : this.height - diff.y
			);
		},

		round: function(entity) {
			var x = entity.location.x % this.width;
			var y = entity.location.y % this.height;

			if (x < 0) x = this.width - x;
			if (y < 0) y = this.height - y;

			entity.location = Vector.new(x, y);
		}
	};
});
