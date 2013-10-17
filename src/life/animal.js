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
			this.factor['visibility'] = 50;
			this.factor['velocity'] = 1;
			this.factor['velocity hunting'] = 100;
			this.factor['velocity escaping'] = 20;
			this.factor['velocity max'] = 1;
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
				this.seeObject(neighbors[i], map, closerPrey, closerPredator);

			neighbors.dispose();



			//////// DEBUG
			var estado;
			var cosa;
			if (closerPrey.target || closerPredator.target) {
				if (closerPredator.distance < closerPrey.distance) {
					estado = 'escaping from';
					cosa = closerPredator;
				} else {
					estado = 'hunting',
					cosa = closerPrey;
				}
			}
			if (cosa) console.log('Animal', this.id, 'is ' + estado, cosa.target.$type, cosa.target.id, 'located at', cosa.distance);
			else      console.log('Animal', this.id, 'is boored');
			//////// DEBUG



			this.boored = !closerPrey.target && !closerPredator.target;
			if (this.boored)
				return memory.disposeAll(closerPrey, closerPredator);

			var force, target;
			if (closerPredator.distance < closerPrey.distance) {
				target = closerPredator.target;
				force = this.factor['velocity escaping'] / closerPredator.distance;
			} else {
				target = closerPrey.target;
				force = this.factor['velocity hunting'] - closerPrey.distance;
			}

			this.shove(this.angle(target), force * this.factor['velocity']);
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
			if (distance >= closerPredator.distance) return;

			closerPredator.target = predator;
			closerPredator.distance = distance;
		},

		hunt: function(prey, distance, closerPrey) {
			//if (this.areSameSpecies(prey) && !this.areSameSpecies(food.prey)) return;
			if (!this.canFight(prey)) return;
			if (distance >= closerPrey.distance) return;

			closerPrey.target = prey;
			closerPrey.distance = distance;

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
			if (this.velocity > this.factor['velocity max'])
				this.velocity = this.factor['velocity max'];

			life.move.call(this);
		}
	});

	return animal;
});
