//jshint unused:false

define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var pool = require('core/pool');
	var type = require('core/type');

	require('life/life');
	var life = memory.resource('LIFE');
	var object = memory.resource('OBJECT');

	var animal = type(life, {

		$type: 'ANIMAL',

		canReproduce: function() { },
		reproduce: function() { },

		tick: function(map) {
			life.tick.call(this);

			if (this.canReproduce())
				this.reproduce();
			else
				this.interact(map);

			//map.updateLocation(this);
		},

		areSameSpecies: function(target) {
			return Object.getPrototypeOf(target) === Object.getPrototypeOf(this);
		},

		interact: function(map) {
			var food = object.new();
			var predator = object.new();
			var velocity;
			var neighbors = map.getRangeFromEntity(this, this.radius * this.factor.visibility)
				.getAll();

		}

	});

	memory.add(pool.new(animal));
	return animal;
});
	food: [ isPrototype(Animal) ],
	factor: {
		'visibility': 10,
		'velocity': 1,
		'velocity hunting': 100,
		'velocity escaping': 20,
		'max velocity': 10,
		'interaction brake': 2
	},

	interact: function(map) {
		var neighbors = map.getRangeFromElement(this, this.diameter * this.factor['visibility']).getAll(),
			// closer food and closer predator
			food = {},
			predator = {},
			velocity;

		food.target = predator.target = null;
		food.distance = predator.distance = Infinity;

		for (var i = neighbors.length; i--; )
			this.seeObject(neighbors[i], map, food, predator);

		this.boored = true;

		if (food.target) {

			this.boored = false;
			velocity = (this.factor['velocity hunting'] - closer.food.distance) * this.factor['velocity'];
			if (velocity > 0)
				this.shove(this.angle(food), velocity);

		} else if (predator.target) {

			this.boored = false;
			velocity = (this.factor['velocity escaping'] / closer.predator.distance) * this.factor['velocity'];
			this.shove(this.angle(predator), velocity);
		}
	},

	seeObject: function(target, map, food, predator) {
		var distance = map.getShorterDistance(this, target);
		//var distance = this.distance(target);

		if (this.isFood(target)) {
			this.hunt(target, distance, food);
		} else if (this.isPredator(target) && distance < predator.distance) {
			predator.distance = distance;
			predator.target = target;
		}
	},

	isFood: function(target) {
		if (this === target || this.isFamily(target))
			return false;

		return this.food.some(target);
	},

	isPredator: function(target) {
		return isAnimal(target) && target.isFood(this) && target.fight(this);
	},

	hunt: function(target, distance, closerFood) {
		// Not canivalism if possible
		if (this.hasSamePrototype(target) && !this.hasSamePrototype(closerFood.target))
			return;

		if (!this.fight(target))
			return;

		if (this.testCollision(target)) {
			this.eat(target);
		} else if (distance < closerFood.distance) {
			closerFood.distance = distance;
			closerFood.target = target;
		}
	},

	fight: function(target) {
		if (isAnimal(target))
			return this.diameter > target.diameter;
		return true;
	},

	eat: function(target) {
		this.diameter *= Math.sqrt((target.getArea() / this.getArea()) + 1);
		target.die();
		this.emitter.emit('eat', this, target);
	},

	move: function() {
		if (this.getVelocity() > this.factor['max velocity'])
			this.setVelocity(this.factor['max velocity']);

		LifeForm.move.call(this);
	}
});

var isAnimal = isPrototype(Animal);
