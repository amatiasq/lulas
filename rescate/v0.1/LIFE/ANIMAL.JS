var Animal = (function() {
	function Animal() {
		LifeForm.call(this);
		this.kindom = LifeClassification.Animal;
		
		this.factorVelocity = 1;
		this.factorFoodEnergy = 100;
		this.factorVisibility = 10;
		this.factorFoodMaxVelocity = 100;
		this.factorPredatorMaxVelocity = 20;
		this.factorReproductor = 100;
		this.factorSplitVelocity = 10;
		this.factorBrake = 0.5;
		this.factorEnergyLoss = 0.01;
		this.factorEnergyFood = 0.0001;

		this.diet = Animal.Diet.VEGETARIAN;
		this.onReproduce = new Event();
		this.food = [];
		this.energy = 1;
		this.boored = false;
		
		this.childConstructor = Function.empty;
	}
	Animal.Diet = new Enum('VEGETARIAN', 'CARNIVORE');
	Animal.prototype = new LifeForm();
	Animal.property('childConstructor');
	Animal.property('diet');

	/*	
	Animal.prototype.setDiet = function(diet) {
		this.food = diet === Animal.Diet.VEGETARIAN ? [ Plant ] : [ Animal ];
		this.diet = diet;
	};
	*/
	Animal.prototype.isFood = function(target) {
		if (this.isFamily(target))
			return false;
		for (var i=this.food.length; i--; )
			if (target instanceof this.food[i])
				return true;
		return false;
	};
	Animal.prototype.eat = function(target) {
		target.die();
		this.energy += target.getArea() * this.factorEnergyFood;
		this.size.add(target.getArea() / this.factorFoodEnergy);
	};
	Animal.prototype.fight = function(target) {
		return true;
	};
	Animal.prototype.interact = function() {
		this.boored = true;
		var initialShove =
		this.tmpCloserFood =
		this.tmpCloserPredator = new Phisics.Force(0, 10000);
		this.tmpCurrentTarget = null;
		this.map.getRangeFromElement(this, this.size.x * this.factorVisibility).forEach(this.seeObject.bind(this));
		if (this.tmpCloserFood !== initialShove)
			this.shove(this.tmpCloserFood.getDirection(),
				(this.factorFoodMaxVelocity / this.tmpCloserFood.getStrength()) * this.factorVelocity);
		//if (this.tmpCloserPredator !== initialShove)
		//	this.shove(this.tmpCloserPredator.getDirection(),
		//		(this.factorPredatorMaxVelocity / this.tmpCloserPredator.getStrength()) * this.factorVelocity);
	};
	Animal.prototype.seeObject = function(target) {
		var distance = this.distance(target);
		if (this.isFood(target)) {
			this.boored = false;
			this.hunt(target, distance);
		} else if (target instanceof Animal &&
			target.isFood(this) &&
			target.fight(this) &&
			distance < this.tmpCloserPredator.getStrength()) {
			this.boored = true;
			this.tmpCloserPredator = new Phisics.Force(target.angle(this), distance);
		}
	};
	Animal.prototype.hunt = function(target, distance) {
		if (this.testCollision(target)) {
			if (this.fight(target))
				this.eat(target);
		} else if (this.fight(target) && distance < this.tmpCloserFood.getStrength()) {
			this.tmpCloserFood = new Phisics.Force(this.angle(target), distance);
		}
	};
	Animal.prototype.canReproduce = function() {
		return this.getArea() > this.factorReproductor;
	};
	Animal.prototype.reproduce = function() {
		var child = this.childConstructor(this);
		var direction = Math.round(Math.random() * 380);
		var strength = this.factorSplitVelocity;
		this.size.multiply(0.5);
		this.shove(direction, strength);
		child.shove(direction + 180, strength);
		this.onReproduce.fire(child);
	};
	var base_tick = Animal.prototype.tick;
	/*
	function looseEnergy() {
		this.energy -= this.factorEnergyLoss;
		if (this.energy <= 0)
			this.die();
	}
	*/
	Animal.prototype.tick = function() {
		if (this.isStopped())
			this.boored = true;
		if (this.boored) {
			this.modifyDirection((Math.random() * 5) - 3);
			if (this.getVelocity() < 10)
				this.shove(this.getDirection(), Math.random() * 3 * this.factorVelocity);
		} else {
			this.brake(this.getVelocity() * this.factorBrake);
		}
		this.interact();
		this.move();
		//looseEnergy.call(this);
		if (this.canReproduce())
			this.reproduce();
		base_tick.apply(this, arguments);
	};
	Animal.prototype.toString = Phisics.idToString('Animal');
	return Animal;
})();