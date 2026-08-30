describe("Vector class", function() {
	var Vector = Phisics.Vector;
	var v = new Vector(3, 4);

	describe("Equals method", function() {
		it("should return true if two vectors properties have same values", function() {
			expect(v.equals(new Vector(3, 4))).toBeTrue();
		});
		it("should return false in any other case", function() {
			expect(v.equals(new Vector(4, 3))).toBeFalse();
			expect(v.equals(new Vector(0, 0))).toBeFalse();
			expect(v.equals(new Vector(3, 1))).toBeFalse();
			expect(v.equals(new Vector(1, 4))).toBeFalse();
		});
	});
	describe("Copy method", function() {
		var copy = v.copy();
		it("must return a new vector with same values than original", function() {
			expect(copy.equals(v)).toBeTrue();
		});
		it("must not change the original vector when modify copy values", function() {
			copy.x = 5;
			copy.y += 3;
			expect(v.x).toBe(3);
			expect(v.y).toBe(4);
		});
	});
	describe("IsZero method", function() {
		it("must return true only if both x and y properties are 0", function() {
			expect(new Vector(0, 0).isZero()).toBeTrue();
			expect(new Vector(3, 0).isZero()).toBeFalse();
			expect(new Vector(0, 2).isZero()).toBeFalse();
			expect(v.isZero()).toBeFalse();
		});
	});
	/* It produces indeterministic fails
	describe("Round method", function() {
		var vec;
		beforeEach(function() {
			vec = new Vector(Math.random(), Math.random())
		});
		it("must return same vector instance", function() {
			expect(vec.round()).toBe(vec);
		});
		it("must round both properties with two decimals by default", function() {
			expect(vec.x * 100).not.toBe(Math.round(vec.x * 100));
			expect(vec.y * 100).not.toBe(Math.round(vec.y * 100));
			vec.round();
			expect(vec.x * 100).toBe(Math.round(vec.x * 100));
			expect(vec.y * 100).toBe(Math.round(vec.y * 100));
		});
		it("must round both properties with decimals as given for example 0", function() {
			expect(vec.x).not.toBe(Math.round(vec.x));
			expect(vec.y).not.toBe(Math.round(vec.y));
			vec.round(0);
			expect(vec.x).toBe(Math.round(vec.x));
			expect(vec.y).toBe(Math.round(vec.y));
		});
		it("or 1", function() {
			expect(vec.x * 10).not.toBe(Math.round(vec.x * 10));
			expect(vec.y * 10).not.toBe(Math.round(vec.y * 10));
			vec.round(1);
			expect(vec.x * 10).toBe(Math.round(vec.x * 10));
			expect(vec.y * 10).toBe(Math.round(vec.y * 10));
		});
	});
	*/
	describe("Abs method", function() {
		it("must return same vector instance", function() {
			var vec = new Vector(3, 5);
			expect(vec.abs()).toBe(vec);
		});
		it("must not modify vector if values are positive", function() {
			expect(new Vector(3, 5).abs().equals(new Vector(3, 5))).toBeTrue();
		});
		it("must modify only negative values", function() {
			expect(new Vector(-3, 5).abs().equals(new Vector(3, 5))).toBeTrue();
			expect(new Vector(3, -5).abs().equals(new Vector(3, 5))).toBeTrue();
			expect(new Vector(-3, -5).abs().equals(new Vector(3, 5))).toBeTrue();
		});
	});
	describe("Add & Multiply method", function() {
		var copy = new Vector(3, 5);
		it("must modify both properties of vector adding given value", function() {
			copy.add(1);
			expect(copy.equals(new Vector(4, 6))).toBeTrue();
			copy.add(-3);
			expect(copy.equals(new Vector(1, 3))).toBeTrue();
			copy.multiply(4);
			expect(copy.equals(new Vector(4, 12))).toBeTrue();
			copy.multiply(1 / 2)
			expect(copy.equals(new Vector(2, 6))).toBeTrue();
		});
	});
	describe("Merge method", function() {
		var target = new Vector(5, 7);
		it("must modify original vector adding to its properties the values of target properties", function() {
			expect(target.merge(v).equals(new Vector(8, 11))).toBeTrue();
		});
	});
	describe("Diff method", function() {
		var target = new Vector(5, 7);
		it("must return a new vector with the diferences of vector properties against target properties", function() {
			expect(target.diff(v).equals(new Vector(2, 3))).toBeTrue();
		});
	});
	describe("GetHypotenuse method", function() {
		it("must return 0 if vector properties are 0", function() {
			expect(new Vector(0, 0).getHypotenuse()).toBe(0);
		});
		it("must return the hipotenuse with the corresponding formule", function() {
			expect(v.getHypotenuse()).toBe(5);
			expect(new Vector(5, 5).getHypotenuse()).toBe(Math.sqrt(50));
		});
	});
	describe("GetAngle method", function() {
		it("must return 0 if vector properties are 0", function() {
			expect(new Vector(0, 0).getAngle()).toBe(0);
		});
		it("must return 0 if vector property y is 0 and x positive", function() {
			expect(new Vector(3, 0).getAngle()).toBe(0);
			expect(new Vector(7, 0).getAngle()).toBe(0);
		});
		it("and between 0 and 45 if x is bigger than y", function() {
			expect(new Vector(3, 1).getAngle()).toBeBetween(0, 45);
		});
		it("must return 45 if vector properties are positive and equals", function() {
			expect(new Vector(3, 3).getAngle()).toBe(45);
			expect(new Vector(5, 5).getAngle()).toBe(45);
		});
		it("and between 45 and 90 if y is bigger than x", function() {
			expect(new Vector(1, 3).getAngle()).toBeBetween(45, 90);
		});
		it("must return 90 if vector property x is 0 and y positive", function() {
			expect(new Vector(0, 3).getAngle()).toBe(90);
			expect(new Vector(0, 7).getAngle()).toBe(90);
		});
		it("and between 90 and 135 if y is bigger than x", function() {
			expect(new Vector(-1, 3).getAngle()).toBeBetween(90, 135);
		});
		it("must return 135 if vector property x is negative and y positive", function() {
			expect(new Vector(-3, 3).getAngle()).toBe(135);
			expect(new Vector(-5, 5).getAngle()).toBe(135);
		});
		it("and between 135 and 180 if x is bigger than y", function() {
			expect(new Vector(-3, 1).getAngle()).toBeBetween(135, 180);
		});
		it("must return 180 if vector property y is 0 and x negative", function() {
			expect(new Vector(-3, 0).getAngle()).toBe(180);
			expect(new Vector(-7, 0).getAngle()).toBe(180);
		});
		it("and between 180 and 225 if x is bigger than y", function() {
			expect(new Vector(-3, -1).getAngle()).toBeBetween(180, 225);
		});
		it("must return 225 if vector properties are negative and equals", function() {
			expect(new Vector(-3, -3).getAngle()).toBe(225);
			expect(new Vector(-5, -5).getAngle()).toBe(225);
		});
		it("and between 225 and 270 if y is bigger than x", function() {
			expect(new Vector(-1, -3).getAngle()).toBeBetween(225, 270);
		});
		it("must return 270 if vector property x is 0 and y negative", function() {
			expect(new Vector(0, -3).getAngle()).toBe(270);
			expect(new Vector(0, -7).getAngle()).toBe(270);
		});
		it("and between 270 and 315 if x is bigger than y", function() {
			expect(new Vector(1, -3).getAngle()).toBeBetween(270, 315);
		});
		it("must return 315 if vector property y is negative and x positive", function() {
			expect(new Vector(3, -3).getAngle()).toBe(315);
			expect(new Vector(5, -5).getAngle()).toBe(315);
		});
		it("and between 315 and 360 if x is bigger than y", function() {
			expect(new Vector(3, -1).getAngle()).toBeBetween(315, 360);
		});
	});
}, true);
describe("Force class", function() {
	var Force = Phisics.Force;
	var f = new Force(45, 10);

	describe("Equals method", function() {
		it("should return true if two forces properties have same values", function() {
			expect(f.equals(new Force(45, 10))).toBeTrue();
		});
		it("should return false in any other case", function() {
			expect(f.equals(new Force(0, 0))).toBeFalse();
			expect(f.equals(new Force(45, 0))).toBeFalse();
			expect(f.equals(new Force(0, 10))).toBeFalse();
			expect(f.equals(new Force(45, 5))).toBeFalse();
			expect(f.equals(new Force(40, 10))).toBeFalse();
			expect(f.equals(new Force(90, 20))).toBeFalse();
		});
	});
	describe("Copy method", function() {
		var copy = f.copy();
		it("must return a new vector with same values than original", function() {
			expect(copy.equals(f)).toBeTrue();
		});
		it("must not change the original vector when modify copy values", function() {
			copy.setDirection(5);
			copy.modifyStrength(3);
			expect(f.getDirection()).toBe(45);
			expect(f.getStrength()).toBe(10);
		});
	});
	describe("GetDirection method", function() {
		it("must return force direction", function() {
			expect(f.getDirection()).toBe(45);
		});
		it("must not return a direction bigger than 360", function() {
			var copy = f.copy();
			for (var i=400; i--; ) {
				copy.setDirection(i);
				expect(copy.getDirection()).toBeLowerThan(360);
			}
		});
	});
	describe("ModifyDirection method", function() {
		var copy = f.copy();
		it("must return the force object", function() {
			expect(copy.modifyDirection(1)).toBe(copy);
		});
		it("must modify force object adding given value to direction", function() {
			copy.setDirection(5);
			expect(copy.modifyDirection(10).getDirection()).toBe(15);
			expect(copy.modifyDirection(-15).getDirection()).toBe(0);
		});
		it("must calc positive degrees when direction become negative", function() {
			copy.setDirection(0);
			expect(copy.modifyDirection(-90).getDirection()).toBe(270);
			expect(copy.modifyDirection(-360).getDirection()).toBe(270);
		});
		it("must not modify strength absolute value", function() {
			expect(Math.abs(copy.modifyDirection(30).getStrength())).toBe(10);
			expect(Math.abs(copy.modifyDirection(361).getStrength())).toBe(10);
			expect(Math.abs(copy.modifyDirection(-180).getStrength())).toBe(10);
			expect(Math.abs(copy.modifyDirection(-90).getStrength())).toBe(10);
		});
	});
	describe("ModifyStrength method", function() {
		var copy = f.copy();
		it("must return the force object", function() {
			expect(copy.modifyStrength(1)).toBe(copy);
		});
		it("must modify force object adding given value to strenth", function() {
			copy.setStrength(5);
			expect(copy.modifyStrength(10).getStrength()).toBe(15);
			expect(copy.modifyStrength(-90).getStrength()).toBe(75);
			expect(copy.modifyStrength(50).getStrength()).toBe(125);
		});
		it("must modify direction absolute value only when strength become negative", function() {
			copy.setStrength(0);
			copy.setDirection(45);
			expect(copy.modifyStrength(10).getDirection()).toBe(45);
			expect(copy.modifyStrength(50).getDirection()).toBe(45);
			expect(copy.modifyStrength(-100).getDirection()).toBe(225);
			expect(copy.modifyStrength(-168).getDirection()).toBe(45);
		});
	});
	describe("GetVector method", function() {
		var Vector = Phisics.Vector;
		it("must return a vector instance", function() {
			expect(f.getVector()).toBeInstanceOf(Vector);
		});
		describe("Vector properties can never be bigger than strength", Function.empty);
		it("must return a 0 vector if force properties are 0", function() {
			expect(new Force(0, 0).getVector().equals(new Vector(0, 0))).toBeTrue();
		});
		it("must return x positive with strength value and y 0 if direction is 0", function() {
			expect(new Force(0, 10).getVector().equals(new Vector(10, 0))).toBeTrue();
		});
		it("and x bigger than y if direction is between 0 and 45", function() {
			function test(vec) {
				expect(vec.y).toBeBetween(0, force.getStrength());
				expect(vec.x).toBeBetween(vec.y, force.getStrength());
			}
			var force = new Force(10, 10);
			test(force.getVector());
			test(force.setDirection(30).getVector());
		});
		it("must return x and y with same value when direction is 45", function() {
			var force = new Force(45, 10);
			var vec = force.getVector().round();
			expect(vec.x).toBe(vec.y);
			expect(vec.x).toBeBetween(0, force.getStrength());
		});
		it("and x lower than y if direction is between 45 and 90", function() {
			function test(vec) {
				expect(vec.x).toBeBetween(0, force.getStrength());
				expect(vec.y).toBeBetween(vec.x, force.getStrength());
			}
			var force = new Force(55, 10);
			test(force.getVector());
			test(force.setDirection(80).getVector());
		});
		it("must return x 0 and y with strength value if direction is 90", function() {
			expect(new Force(90, 10).getVector().round().equals(new Vector(0, 10))).toBeTrue();
		});
		it("and x negative and lower than y if direction is between 90 and 135", function() {
			function test(vec) {
				expect(vec.x).toBeNegative();
				vec.abs();
				expect(vec.x).toBeBetween(0, force.getStrength());
				expect(vec.y).toBeBetween(vec.x, force.getStrength());
			}
			var force = new Force(100, 10);
			test(force.getVector());
			test(force.setDirection(125).getVector());
		});
		it("must return x and y with same value but x negative when direction is 135", function() {
			var force = new Force(135, 10);
			var vec = force.getVector().round();
			expect(vec.x).toBeNegative();
			vec.abs();
			expect(vec.x).toBeBetween(0, force.getStrength());
			expect(vec.y).toBe(vec.x);
		});
		it("and x bigger than y but negative if direction is between 135 and 180", function() {
			function test(vec) {
				expect(vec.x).toBeNegative();
				vec.abs();
				expect(vec.y).toBeBetween(0, force.getStrength());
				expect(vec.x).toBeBetween(vec.y, force.getStrength());
			}
			var force = new Force(145, 10);
			test(force.getVector());
			test(force.setDirection(170).getVector());
		});
		it("must return x negative with strength value and y 0 if direction is 180", function() {
			expect(new Force(180, 10).getVector().round().equals(new Vector(-10, 0))).toBeTrue();
		});
		it("and x bigger than y both negative if direction is between 180 and 225", function() {
			function test(vec) {
				expect(vec.y).toBeBetween(-force.getStrength(), 0);
				expect(vec.x).toBeBetween(-force.getStrength(), vec.y);
			}
			var force = new Force(190, 10);
			test(force.getVector());
			test(force.setDirection(215).getVector());
		});
		it("must return x and y with same negative value when direction is 225", function() {
			var force = new Force(225, 10);
			var vec = force.getVector().round();
			expect(vec.x).toBe(vec.y);
			expect(vec.x).toBeBetween(-force.getStrength(), 0);
		});
		it("and x lower than y both negative if direction is between 225 and 270", function() {
			function test(vec) {
				expect(vec.x).toBeBetween(-force.getStrength(), 0);
				expect(vec.y).toBeBetween(-force.getStrength(), vec.x);
			}
			var force = new Force(235, 10);
			test(force.getVector());
			test(force.setDirection(260).getVector());
		});
		it("must return x 0 and y with negative strength value if direction is 270", function() {
			expect(new Force(270, 10).getVector().round().equals(new Vector(0, -10))).toBeTrue();
		});
		it("and x lower than y but y must be negative if direction is between 270 and 315", function() {
			function test(vec) {
				expect(vec.y).toBeNegative();
				vec.abs();
				expect(vec.x).toBeBetween(0, force.getStrength());
				expect(vec.y).toBeBetween(vec.x, force.getStrength());
			}
			var force = new Force(280, 10);
			test(force.getVector());
			test(force.setDirection(305).getVector());
		});
		it("must return x and y with same value but y negative when direction is 315", function() {
			var force = new Force(315, 10);
			var vec = force.getVector().round();
			expect(vec.y).toBeNegative();
			vec.abs();
			expect(vec.x).toBeBetween(0, force.getStrength());
			expect(vec.y).toBe(vec.x);
		});
		it("and x bigger than y but y must be negative if direction is between 315 and 360", function() {
			function test(vec) {
				expect(vec.y).toBeNegative();
				vec.abs();
				expect(vec.y).toBeBetween(0, force.getStrength());
				expect(vec.x).toBeBetween(vec.y, force.getStrength());
			}
			var force = new Force(325, 10);
			test(force.getVector());
			test(force.setDirection(350).getVector());
		});
	});
	describe("Merge method", function() {
		var copy;
		beforeEach(function() {
			copy = f.copy();
		});
		it("must sum strength when direction is same", function() {
			function test(direction) {
				var temp = new Force(direction, 10);
				temp.merge(temp);
				expect(temp.getDirection()).toBe(direction);
				expect(Math.abs(temp.getStrength())).toBe(20);
			}
			test(0);
			test(135);
			test(270);
		});
		it("must get the average direction when strength is same", function() {
			function test(direction1, direction2) {
				var force1 = new Force(direction1, 10);
				var force2 = new Force(direction2, 10);
				force1.merge(force2);
				expect(force1.getDirection()).toBe((direction1 + direction2) / 2);
			}
			test(0, 90);
			test(45, 180);
		});
	});
}, true);
describe("Phisics class", function() {
	describe("On create a new instance", function() {
		var phi;
		beforeEach(function() {
			phi = new Phisics();
		});

		it("must have all properties to NaN", function() {
			expect(phi.getX()).toBeNaN();
			expect(phi.getY()).toBeNaN();
			expect(phi.getWidth()).toBeNaN();
			expect(phi.getHeight()).toBeNaN();
		});
		it("must have setters for all four properties", function() {
			expect(phi.setX).toBeFunction();
			expect(phi.setY).toBeFunction();
			expect(phi.setWidth).toBeFunction();
			expect(phi.setHeight).toBeFunction();
		});
	});
	describe("getEnd... methods", function() {
		var phi = new Phisics(2, 4, 7, 9);

		it("must return the addition of location and size", function() {
			expect(phi.getEndX()).toBe(9);
			expect(phi.getEndY()).toBe(13);
		});
	});
	describe("Method testCollision", function() {
		var phi = new Phisics(10, 10, 5, 5);

		it("must return false if target is at the right of object", function() {
				var target = new Phisics(3, 11, 3, 3);
				expect(phi.testCollision(target)).toBe(false);
		});
		it("must return false if target is at the top of object", function() {
				var target = new Phisics(11, 3, 3, 3);
				expect(phi.testCollision(target)).toBe(false);
		});
		it("must return false if target is at the left of object", function() {
				var target = new Phisics(17, 11, 3, 3);
				expect(phi.testCollision(target)).toBe(false);
		});
		it("must return false if target is at the bottom of object", function() {
				var target = new Phisics(11, 17, 3, 3);
				expect(phi.testCollision(target)).toBe(false);
		});
		it("should return true if target touches the right of object", function() {
				var target = new Phisics(8, 11, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the top of object", function() {
				var target = new Phisics(11, 8, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the left of object", function() {
				var target = new Phisics(14, 11, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the bottom of object", function() {
				var target = new Phisics(11, 14, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the top-right corner of object", function() {
				var target = new Phisics(8, 8, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the top-left corner of object", function() {
				var target = new Phisics(8, 14, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the bottom-right corner of object", function() {
				var target = new Phisics(14, 8, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target touches the bottom-left corner of object", function() {
				var target = new Phisics(14, 14, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target is inside object", function() {
				var target = new Phisics(11, 11, 3, 3);
				expect(phi.testCollision(target)).toBe(true);
		});
		it("should return true if target contains object", function() {
				var target = new Phisics(9, 9, 7, 7);
				expect(phi.testCollision(target)).toBe(true);
		});
	});
	describe("Move method", function() {
		var phi = new Phisics(10, 10, 1, 1);;
		beforeEach(function() {
			phi.setX(10);
			phi.setY(10);
			phi.setVelocity(1);
			phi.setDirection(0);
		});

		it("should move $(velocity) points at X axis and not move Y if direction is 0", function() {
			phi.setDirection(0);
			phi.move();
			expect(phi.getX()).toBe(11);
			expect(phi.getY()).toBe(10);
		});
		it("should move $(velocity) points at Y axis and not move X if direction is 90", function() {
			phi.setDirection(90);
			phi.move();
			expect(phi.getX()).toBe(10);
			expect(phi.getY()).toBe(11);
		});
		it("should move -$(velocity) points at X axis and not move Y if direction is 180", function() {
			phi.setDirection(180);
			phi.move();
			expect(phi.getX()).toBe(9);
			expect(phi.getY()).toBe(10);
		});
		it("should move -$(velocity) points at Y axis and not move X if direction is 270", function() {
			phi.setDirection(270);
			phi.move();
			expect(phi.getX()).toBe(10);
			expect(phi.getY()).toBe(9);
		});
		it("should move in two axies the same points if direction is 45 or 225", function() {
			phi.setDirection(45);
			phi.move();
			expect(phi.getX()).toBe(phi.getY());
			phi.setDirection(225);
			phi.move();
			expect(phi.getX()).toBe(phi.getY());
		});
		it("should move in two axies the same points but opposite if direction is 135 or 315", function() {
			phi.setDirection(135);
			phi.move();
			expect(phi.getX() + phi.getY()).toBe(20);
			phi.setDirection(315);
			phi.move();
			expect(phi.getX() + phi.getY()).toBe(20);
		});
	});
	describe("ModifiyVelocity method", function() {
		var phi = new Phisics();
		it("should add given value to velocity property", function() {
			phi.modifyVelocity(5);
			expect(phi.getVelocity()).toBe(5);
			phi.modifyVelocity(7);
			expect(phi.getVelocity()).toBe(12);
		});
	});
	describe("ModifyDirection method", function() {
		var phi = new Phisics();
		beforeEach(function() {
			phi.setDirection(0);
		});

		it("should add given value to direction property", function() {
			phi.modifyDirection(20);
			expect(phi.getDirection()).toBe(20);
			phi.modifyDirection(25);
			expect(phi.getDirection()).toBe(45);
		});
		it("must reduce direction value if it is bigger than 360", function() {
			phi.modifyDirection(360);
			expect(phi.getDirection()).toBe(0);
			phi.modifyDirection(405);
			expect(phi.getDirection()).toBe(45);
			phi.modifyDirection(180);
			expect(phi.getDirection()).toBe(225);
			phi.modifyDirection(181);
			expect(phi.getDirection()).toBe(46);
		});
		it("must reduce direction and add it 360 if value is negative", function() {
			phi.modifyDirection(-30);
			expect(phi.getDirection()).toBe(330);
			phi.setDirection(0);
			phi.modifyDirection(-400);
			expect(phi.getDirection()).toBe(320);
			phi.setDirection(0);
			phi.modifyDirection(-360);
			expect(phi.getDirection()).toBe(0);
		});
	});
	describe("Shove method", function() {
		var phi;
		beforeEach(function() {
			phi = new Phisics();
		});
		it("should modify velocity as much as shove strength if direction is same", function() {
			phi.shove(0, 50);
			expect(phi.getVelocity()).toBe(50);
			phi.shove(0, 10);
			expect(phi.getVelocity()).toBe(60);
			phi.shove(0, 100);
			expect(phi.getVelocity()).toBe(160);
		});
		it("should substract velocity and not modify direction if shove direction is opposite", function() {
			phi.shove(0, 50);
			expect(phi.getVelocity()).toBe(50);
			phi.shove(180, 30);
			expect(phi.getVelocity()).toBe(20);

			phi = new Phisics();
			phi.shove(45, 100);
			expect(Math.round(phi.getDirection())).toBe(45);
			expect(Math.round(phi.getVelocity())).toBe(100);
			phi.shove(225, 60);
			expect(Math.round(phi.getDirection())).toBe(45);
			expect(Math.round(phi.getVelocity())).toBe(40);
			phi.shove(225, 60);
			expect(Math.round(phi.getDirection())).toBe(225);
			expect(Math.round(phi.getVelocity())).toBe(20);
			phi.shove(225, 60);
			expect(Math.round(phi.getDirection())).toBe(225);
			expect(Math.round(phi.getVelocity())).toBe(80);
		});
		it("should merge directions if velocity is same", function() {
			var hypotenuse = Math.round(Math.sqrt(Math.pow(50, 2) * 2, 2));
			phi.shove(45, 50);
			phi.shove(135, 50);
			expect(Math.round(phi.getVelocity())).toBe(hypotenuse);
			expect(Math.round(phi.getDirection())).toBe(90);

			phi.setVelocity(50);
			phi.shove(180, 50);
			expect(Math.round(phi.getVelocity())).toBe(hypotenuse);
			expect(Math.round(phi.getDirection())).toBe(135);

			phi.setVelocity(50);
			phi.shove(0, 50);
			expect(Math.round(phi.getDirection())).toBe(Math.round(135 / 2));
		});
	});
	describe("Brake method", function() {
		var phi;
		beforeEach(function() {
			phi = new Phisics();
			phi.setVelocity(100);
		});
		it("should reduce velocity with given strength", function() {
			phi.brake(10);
			expect(phi.getVelocity()).toBe(90);
			phi.brake(0.1)
			expect(phi.getVelocity()).toBe(89.9);
		});
		it("should set velocity to 0 if result velocity is negative", function() {
			phi.brake(200);
			expect(phi.getVelocity()).toBe(0);
		});
	});
	describe("Stop method", function() {
		var phi;
		beforeEach(function() {
			phi = new Phisics();
		});
		it("should set velocity to 0", function() {
			phi.setVelocity(50);
			phi.stop();
			expect(phi.getVelocity()).toBe(0);

			phi.setVelocity(99);
			phi.stop();
			expect(phi.getVelocity()).toBe(0);

			phi.setVelocity(1000);
			phi.stop();
			expect(phi.getVelocity()).toBe(0);
		});
	});
	describe("IsStopped method", function() {
		var phi;
		beforeEach(function() {
			phi = new Phisics();
		});
		it("should return true if velocity rounded to 1 decimal is 0", function() {
			phi.setVelocity(0.0354);
			expect(phi.isStopped()).toBeTrue();
			phi.setVelocity(0.0954);
			expect(phi.isStopped()).toBeFalse();
			phi.setVelocity(1);
			expect(phi.isStopped()).toBeFalse();
			phi.setVelocity(1.034);
			expect(phi.isStopped()).toBeFalse();
		});
	});
}, true);
