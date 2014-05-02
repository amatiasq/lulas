//jshint unused:false

define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Vector = require('physics/vector');

	function Map() {
		this.width = 100;
		this.height = 100;
		this.cellSize = 10;
	}

	Map.prototype = {
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
	};

	Object.defineProperties(Map.prototype, descriptors({
		constructor: Map,

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
			return new Vector(
				diff.x < this.halfWidth ? diff.x : this.width - diff.x,
				diff.y < this.halfHeight ? diff.y : this.height - diff.y
			);
		},

		round: function(entity) {
			var x = entity.location.x % this.width;
			var y = entity.location.y % this.height;

			if (x < 0) x = this.width - x;
			if (y < 0) y = this.height - y;

			entity.location = new Vector(x, y);
		}
	}));

	return Map;
});
