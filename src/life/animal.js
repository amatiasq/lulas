//jshint sub:true

define(function(require) {
	'use strict';
	var extend = require('core/extend');
	var Vector = require('physics/vector');
	var Life = require('life/life');

	function isAnimal(entity) {
		return Animal.isPrototypeOf(entity);
	}

	var Animal;
	return Animal = extend(Object.create(Life), {
		$type: 'ANIMAL',

		// abstract
		canReproduce: function() { },
		reproduce: function() { },

		init: function(location, diameter, parents) {
			Life.init.call(this, location, diameter, parents);
			this.factor['visibility'] = 500;
			this.factor['velocity'] = 1;
			this.factor['velocity hunting'] = 1000;
			this.factor['velocity escaping'] = 200;
			this.factor['velocity max'] = 10;
			this.factor['friction'] = 0.1;
		},

		tick: function(map) {
			Life.tick.call(this);

			if (this.canReproduce())
				return this.reproduce();

			this.interact(map);
			//map.updateLocation(this);
		},

		/*
		areSameSpecies: function(target) {
			return Object.getPrototypeOf(target) === Object.getPrototypeOf(this);
		},
		*/

		interact: function(map) {
			var none = Vector.BIGGER;
			var closer = { prey: none, predator: none };
			var neighbors = map.getEntitiesAt(this.location, this.radius * this.factor['visibility']);

			for (var i = neighbors.length; i--;)
				if (neighbors[i] !== this)
					this.seeObject(neighbors[i], map, closer);

			this.boored = closer.prey === none && closer.predator === none;
			if (this.boored)
				return;

			var force = closer.predator.magnitude < closer.prey.magnitude ?
				Vector.from(closer.predator.degrees + 180,
					this.factor['velocity escaping'] / closer.predator.magnitude) :
				Vector.from(closer.prey.degrees,
					this.factor['velocity hunting'] / closer.prey.magnitude);

			this.shove(force.multiply(this.factor['velocity']));
		},

		seeObject: function(target, map, closer) {
			var distance = map.getShorterDistance(this.location, target.location);

			if (this.isPredator(target))
				closer.predator = this.escape(target, distance, closer.predator);
			else if (this.isFood(target))
				closer.prey = this.hunt(target, distance, closer.prey);
		},

		isPredator: function(target) {
			return target.isFood && target.isFood(this);
		},

		isFood: function(target) {
			if (this === target || this.isFamily(target)) return false;
			return this._isFood(target);
		},

		_isFood: function(target) {
			return isAnimal(target);
		},

		escape: function(predator, distance, other) {
			if (!predator.canFight(this)) return other;
			if (distance.magnitude >= other.magnitude) return other;
			return distance;
		},

		hunt: function(prey, distance, other) {
			if (!this.canFight(prey)) return other;
			if (distance.magnitude >= other.magnitude) return other;

			if (this.testCollision(prey))
				this.eat(prey);

			return distance;
		},

		canFight: function(target) {
			return !isAnimal(target) || this.diameter > target.diameter;
		},

		eat: function(prey) {
			var maxFood = Math.min(this.diameter, prey.diameter);
			this.diameter += maxFood;
			prey.diameter -= maxFood;

			if (prey.diameter <= 0)
				prey.die();
		},

		move: function() {
			this.velocity *= 1 - this.factor['friction'];

			if (this.velocity > this.factor['velocity max'])
				this.velocity = this.factor['velocity max'];

			Life.move.call(this);
		}
	});
});
