function Carnivore() {
	Animal.apply(this, arguments);
	AnimalGraphic.apply(this, arguments);
	
	this.factorVelocity = 1;
	this.factorVisibility = 30;
	this.factorReproductor = 16 * 16;
	//this.factorBrake = 0.3;
	
	this.diet = Animal.Diet.CARNIVORE;
	this.food = [ Animal ];
}
Carnivore.prototype = new Animal();
Carnivore.prototype.hunt = function(target, distance) {
	if ((this.tmpCurrentTarget instanceof Vegetarian) && (target instanceof Carnivore))
		return;
	if (this.testCollision(target)) {
		if (this.fight(target))
			this.eat(target);
	} else if (this.fight(target) && distance < this.tmpCloserFood.getStrength()) {
		this.tmpCurrentTarget = target;
		this.tmpCloserFood = new Phisics.Force(this.angle(target.getNextPosition()), distance);
	}
};
Carnivore.prototype.fight = function(target) {
	return this.getArea() >= target.getArea();
};

Carnivore.prototype.toString = Phisics.idToString('Carnivore');
