//jshint sub:true

define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var type = require('core/type');
	var life = require('life/life');
	var object = memory.resource('OBJECT');

	function isAnimal(entity) {
		return animal.isPrototypeOf(entity);
	}

	var animal = type(life, {

		$type: 'ANIMAL',

		// abstract
		canReproduce: function() { },
		reproduce: function() { },

		init: function(location, diameter) {
			life.init.call(this, location, diameter);
			this.factor['visibility'] = 500;
			this.factor['velocity'] = 1;
			this.factor['velocity hunting'] = 1000;
			this.factor['velocity escaping'] = 200;
			this.factor['velocity max'] = 10;
			this.factor['friction'] = 0.1;
		},

		tick: function(map) {
			life.tick.call(this);

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
			var closerPrey = object.new();
			var closerPredator = object.new();
			var neighbors = map.getEntitiesAt(this.location, this.radius * this.factor['visibility']);

			closerPrey.target = closerPredator.target = null;
			closerPrey.distance = closerPredator.distance = Infinity;

			for (var i = neighbors.length; i--;)
				if (neighbors[i] !== this)
					this.seeObject(neighbors[i], map, closerPrey, closerPredator);

			neighbors.dispose();

			this.boored = !closerPrey.target && !closerPredator.target;
			if (this.boored)
				return memory.disposeAll(closerPrey, closerPredator);

			var target;
			if (closerPredator.distance < closerPrey.distance) {
				target = closerPredator;
				target.velocity = this.factor['velocity escaping'] / closerPredator.distance;
			} else {
				target = closerPrey;
				target.velocity = this.factor['velocity hunting'] / closerPrey.distance;
			}

			this.shove(target.angle, target.velocity * this.factor['velocity']);
			memory.disposeAll(closerPrey, closerPredator);
		},

		seeObject: function(target, map, closerPrey, closerPredator) {
			var distance = map.getShorterDistance(this.location, target.location);

			if (this.isPredator(target))
				this.escape(target, distance, closerPredator);
			else if (this.isFood(target))
				this.hunt(target, distance, closerPrey);
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

		escape: function(predator, distance, closerPredator) {
			if (!predator.canFight(this)) return;
			if (distance.hypotenuse >= closerPredator.distance) return;

			closerPredator.target = predator;
			closerPredator.distance = distance.hypotenuse;
			closerPredator.angle = distance.angle;
		},

		hunt: function(prey, distance, closerPrey) {
			//if (this.areSameSpecies(prey) && !this.areSameSpecies(food.prey)) return;
			if (!this.canFight(prey)) return;
			if (distance.hypotenuse >= closerPrey.distance) return;

			closerPrey.target = prey;
			closerPrey.distance = distance.hypotenuse;
			closerPrey.angle = distance.angle;

			if (this.testCollision(prey))
				this.eat(prey);
		},

		canFight: function(target) {
			return !isAnimal(target) || this.diameter > target.diameter;
		},

		eat: function(prey) {
			//this.diameter *= Math.sqrt((target.getArea() / this.getArea()) + 1);
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

			life.move.call(this);
		}
	});

	return animal;
});
