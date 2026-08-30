var Phisics = (function() {
	var undef;
	function round(number, decimals) {
		var operator = Math.pow(10, decimals);
		return Math.round(number * operator) / operator;
	}

	function Vector(x, y) {
		this.x = x !== undef ? x : NaN;
		this.y = y !== undef ? y : this.x;
	}
	Vector.prototype.equals = function(target) {
		return this.x === target.x && this.y === target.y;
	};
	Vector.prototype.copy = function() {
		return new Vector(this.x, this.y);
	};
	Vector.prototype.isZero = function() {
		return this.x === 0 && this.y === 0;
	};
	Vector.prototype.round = function(decimals) {
		decimals = typeof decimals === 'undefined' ? 2 : decimals;
		var operator = Math.pow(10, decimals);
		this.x = Math.round(this.x * operator) / operator;
		this.y = Math.round(this.y * operator) / operator;
		return this;
	};
	Vector.prototype.abs = function() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	};
	Vector.prototype.add = function(val) {
		this.x += val;
		this.y += val;
		return this;
	};
	Vector.prototype.multiply = function(val) {
		this.x *= val;
		this.y *= val;
		return this;
	};
	Vector.prototype.merge = function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	};
	Vector.prototype.diff = function(vector) {
		return new Vector(
			this.x - vector.x,
			this.y - vector.y
		);
	};
	Vector.prototype.getHypotenuse = function() {
		if (this.isZero())
			return 0;
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2), 2)
	};
	Vector.prototype.getAngleRadians = function() {
		var arctan = Math.atan(this.y / this.x);
		if (arctan < 0)
			arctan = Math.PI + arctan;
		if (this.y < 0 || (this.y === 0 && this.x < 0))
			arctan += Math.PI;
		return arctan
	};
	Vector.prototype.getAngleObject = function() {
		return new Degree(this.getAngleRadians() / Math.PI * 180);
	};
	Vector.prototype.getAngle = function() {
		return this.getAngleObject().getValue();
	};
	Vector.prototype.toString = function() {
		return "[object Vector] { x: " + this.x + ", y: " + this.y + " }";
	};

	function Degree(value) {
		this.setValue(value);
	}
	function Degree_fix() {
		this.value = this.value || 0;
		this.value %= 360;
		if (this.value < 0)
			this.value += 360;
	};
	Degree.prototype.copy = function() {
		return new Degree(this.value);
	};
	Degree.prototype.add = function(val) {
		this.value += val;
		Degree_fix.call(this);
		return this;
	};
	Degree.prototype.substract = function(val) {
		this.value -= val;
		Degree_fix.call(this);
		return this;
	};
	Degree.prototype.toRadian = function() {
		return this.value * Math.PI / 180;
	};
	Degree.prototype.toVector = function() {
		var radian = this.toRadian();
		return new Vector(Math.cos(radian), Math.sin(radian));
	};
	Degree.prototype.getValue = function() {
		return this.value;
	};
	Degree.prototype.setValue = function(val) {
		this.value = val;
		Degree_fix.call(this);
	};
	Degree.prototype.toString = function() {
		return "[object Degree] " + this.value;
	};

	function Force(degrees, strength) {
		this.direction = new Degree();
		this.strength = NaN;
		this.setDirection(degrees);
		this.setStrength(strength);
	}
	function Force_fixStrength() {
		if (this.strength < 0) {
			this.direction.setValue(this.direction.getValue() - 180);
			this.strength *= -1;
		}
	};
	Force.prototype.equals = function(target) {
		return this.getDirection() === target.getDirection() &&
			this.getStrength() === target.getStrength();
	};
	Force.prototype.copy = function() {
		return new Force(this.getDirection(), this.getStrength());
	};
	Force.prototype.getDirection = function() {
		return this.direction.getValue();
	};
	Force.prototype.setDirection = function(val) {
		this.direction.setValue(val);
		return this;
	};
	Force.prototype.modifyDirection = function(addition) {
		this.direction.add(addition);
		return this;
	};
	Force.prototype.getStrength = function() {
		return this.strength;
	};
	Force.prototype.setStrength = function(val) {
		this.strength = val;
		Force_fixStrength.call(this);
		return this;
	};
	Force.prototype.modifyStrength = function(addition) {
		this.setStrength(this.getStrength() + addition);
		return this;
	};
	Force.prototype.getVector = function() {
		return this.direction.toVector().multiply(this.getStrength());
	};
	Force.prototype.merge = function(force) {
		var flow = this.getVector(),
			force = force.getVector();
		flow.merge(force);
		this.setStrength(flow.getHypotenuse());
		this.setDirection(flow.getAngle());
		return this;
	};
	Force.prototype.toString = function() {
		return "[object Force] { direction: " + this.getDirection() + ", strength: " + this.strength + "}";
	};

	// It will be incremented in four inheritances
	var uniqueID = -4;
	function Phisics(x, y, width, height) {
		this.location = new Vector(x, y);
		this.size = new Vector(width, height);
		this.movement = new Force(0, 0);

		this.weight = 0.0;
		this.map = null;
		this.id = uniqueID++;

		this.onMove = new Event();
	}
	Phisics.idToString = function(className) {
		var text = "[object " + className + "] { id: ";
		return function() {
			return text + this.id + " }";
		};
	};
	Phisics.property('id', true);
	Phisics.property('movement', true);
	Phisics.property('map');
	Phisics.property('weight');
	Phisics.prototype.setX = function(value) { this.location.x = value > 0 ? value : 0; }
	Phisics.prototype.setY = function(value) { this.location.y = value > 0 ? value : 0; }
	Phisics.prototype.setWidth = function(value) { this.size.x = value > 0 ? value : 0; }
	Phisics.prototype.setHeight = function(value) { this.size.y = value > 0 ? value : 0; }
	Phisics.prototype.getX = function() { return this.location.x; };
	Phisics.prototype.getY = function() { return this.location.y; };
	Phisics.prototype.getWidth = function() { return this.size.x; };
	Phisics.prototype.getHeight = function() { return this.size.y; };
	Phisics.prototype.getEndX = function() {
		return this.location.x + this.size.x;
	};
	Phisics.prototype.getEndY = function() {
		return this.location.y + this.size.y;
	};
	Phisics.prototype.getArea = function() {
		return this.getWidth() * this.getHeight();
	};
	Phisics.prototype.getPosition = function() {
		return this.location.copy();
	};
	Phisics.prototype.getSize = function() {
		return this.size.copy();
	};
	Phisics.prototype.setSize = function(val) {
		this.size.x = val;
		this.size.y = val;
	};
	Phisics.prototype.getDirection = function() {
		return this.movement.getDirection();
	};
	Phisics.prototype.setDirection = function(degree) {
		this.movement.setDirection(degree);
	};
	Phisics.prototype.modifyDirection = function(degree) {
		this.movement.modifyDirection(degree);
	};
	Phisics.prototype.getVelocity = function() {
		return this.movement.getStrength();
	};
	Phisics.prototype.setVelocity = function(value) {
		this.movement.setStrength(value);
	};
	Phisics.prototype.modifyVelocity = function(addition) {
		this.movement.modifyStrength(addition);
	};
	Phisics.prototype.testCollision = function(target) {
		return (
			this.getX() < target.getEndX() &&
			this.getY() < target.getEndY() &&
			this.getEndX() > target.getX() &&
			this.getEndY() > target.getY()
		);
	};
	Phisics.prototype.distance = function(target) {
		if (target instanceof Phisics)
			target = target.location;
		return this.location.diff(target).getHypotenuse();
	};
	Phisics.prototype.angle = function(target) {
		if (target instanceof Phisics)
			target = target.location;
		return target.diff(this.location).getAngle();
	};
	Phisics.prototype.getNextPosition = function() {
		return this.location.copy().merge(this.movement.getVector());
	};
	Phisics.prototype.move = function() {
		this.location.merge(this.movement.getVector());
		this.onMove.fire(this.location);
	};
	Phisics.prototype.shove = function(degrees, strength) {
		var force;
		if (degrees instanceof Force)
			force = degrees;
		else
			force = new Force(degrees, strength * (1 - this.weight));
		this.movement.merge(force);
	};
	Phisics.prototype.accelerate = function(force) {
		this.setVelocity(this.getVelocity() + force);
	};
	Phisics.prototype.brake = function(force) {
		var vel = this.getVelocity() - force;
		if (vel < 0)
			vel = 0;
		this.setVelocity(vel);
	};
	Phisics.prototype.stop = function() {
		this.movement = new Force(0, 0);
	};
	Phisics.prototype.isStopped = function() {
		return Math.round(this.movement.getStrength() * 10) === 0;
	};
	Phisics.prototype.toString = Phisics.idToString('Phisics');
	

	Phisics.Vector = Vector;
	Phisics.Force = Force;
	return Phisics;
})();
