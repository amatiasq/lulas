//jshint sub:true

define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Vector = require('physics/vector');
	var Life = require('life/life');

	function isAnimal(entity) {
		return entity instanceof Animal;
	}

	function Animal(location, diameter, parents) {
		Life.call(this, location, diameter, parents);
		this.factor['visibility'] = 20;
		this.factor['velocity'] = 1;
		this.factor['velocity hunting'] = 1000;
		this.factor['velocity escaping'] = 200;
		this.factor['velocity max'] = 7;
		this.factor['friction'] = 0.1;
	}

	Animal.prototype = Object.create(Life.prototype, descriptors({
		constructor: Animal,

		// abstract
		canReproduce: function() { },
		reproduce: function() { },

		tick: function(map) {
			Life.prototype.tick.call(this);

			if (this.canReproduce())
				return this.reproduce();

			this.interact(map);
			//map.updateLocation(this);
		},

		areSameSpecies: function(target) {
			return Object.getPrototypeOf(target) === Object.getPrototypeOf(this);
		},

		interact: function(map) {
			var none = Vector.BIGGER;
			var closer = { prey: none, predator: none };
			var neighbors = map.getEntitiesAt(this.location, this.radius * this.factor['visibility']);

			for (var i = neighbors.length; i--;)
				if (neighbors[i] !== this)
					this.seeObject(neighbors[i], map, closer);

			if (window.DEBUG)
				console.log(this.id, 'sees', neighbors.length);

			this.boored = closer.prey === none && closer.predator === none;
			if (this.boored)
				return;

			var force = closer.prey !== none ?
				Vector.from(closer.prey.degrees, this.factor['velocity hunting'] / closer.prey.magnitude ) :
				Vector.from(closer.predator.degrees + 180, this.factor['velocity escaping'] / closer.predator.magnitude)

			this.shove(force.multiply(this.factor['velocity']));
		},

		seeObject: function(target, map, closer) {
			var distance = map.getShorterDistance(this.location, target.location);

			if (this.isPredator(target))
				closer.predator = this.escape(target, distance, closer.predator);
			if (this.isFood(target, closer.prey))
				closer.prey = this.hunt(target, distance, closer.prey);
		},

		isPredator: function(target) {
			return target.isFood && target.isFood(this);
		},

		isFood: function(target, alternative) {
			if (this === target || this.isFamily(target)) return false;
			return this._isFood(target, alternative);
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

			Life.prototype.move.call(this);
		}
	}));

	return Animal;
});
