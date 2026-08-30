function Vegetarian() {
	Animal.apply(this, arguments);
	AnimalGraphic.apply(this, arguments);
	
	this.factorVisibility = 10;
	this.factorReproductor = 100;
	//this.factorBrake = 0.3;
	
	this.diet = Animal.Diet.VEGETARIAN;
	this.food = [ Plant ];
}
Vegetarian.prototype = new Animal();
Vegetarian.prototype.toString = Phisics.idToString('Vegetarian');
