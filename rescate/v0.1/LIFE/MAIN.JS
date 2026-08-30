(function() {
	var map, screen, elements = [];
	function random(min, max) {
		if (typeof max === 'undefined') { max = min; min = 0; }
		return Math.round(Math.random() * (max - min)) + min;
	}
	function randomPosition(objSize) {
		return new Phisics.Vector(
			random(screen.x - objSize),
			random(screen.y - objSize)
		);
	}

	Map.prototype.configure = function() {
		this.setCellSize(10);
		this.setColumns(Math.ceil(screen.x / this.getCellSize()));
		this.setRows(Math.ceil(screen.y / this.getCellSize()));
		this.clear();
		return this;
	};
	LifeForm.prototype.configureBasics = function() {
		this.setContainer(document.body);
		this.render();
		this.setMap(map);
		map.addElement(this);
	};
	LifeForm.prototype.configureRandom = function(size) {
		var position = randomPosition(size);
		this.setX(position.x);
		this.setY(position.y);
		this.setHeight(size);
		this.setWidth(size);
		return this;
	};
	LifeForm.prototype.configureChild = function(parent) {
		this.setX(parent.getX());
		this.setY(parent.getY());
		this.setHeight(parent.getHeight() / 2);
		this.setWidth(parent.getWidth() / 2);
		return this;
	};
	Plant.prototype.configure = function() {
		this.configureRandom(random(3, 5));
		this.configureBasics();
		return this;
	};
	Animal_base_configureBasics = Animal.prototype.configureBasics;
	Animal.prototype.configureBasics = function() {
		this.setChildConstructor(reproduceAnimal);
		Animal_base_configureBasics.call(this);
	};
	Animal.prototype.configure = function() {
		this.configureRandom(random(5, 15));
		this.configureBasics();
		this.setColor(random(255));
		return this;
	};
	Animal_base_configureChild = Animal.prototype.configureChild;
	Animal.prototype.configureChild = function(parent) {
		this.addParent(parent);
		Animal_base_configureChild.call(this, parent);
		this.configureBasics();
		this.setColor(parent.getColor());
		return this;
	};
	function reproduceAnimal(self) {
		var constructor = self.getDiet() === Animal.Diet.CARNIVORE ? Carnivore : Vegetarian;
		var animal = new constructor().configureChild(self);
		elements.push(animal);
		return animal;
	};

	function Main() {
		screen = new Phisics.Vector(document.body.clientWidth, document.body.clientHeight);
		map = new Map().configure();

		for (var i=20; i--; )
			elements.push(new Plant().configure());
		for (var i=10; i--; )
			elements.push(new Carnivore().configure());
		for (var i=10; i--; )
			elements.push(new Vegetarian().configure());
		//map.print(document.body);

		Logger.div = Dom.create('div');
		Logger.div.className = "Logger-div Logger-hidden";
		document.body.appendChild(Logger.div);

		var ticks = 0;
		Timer.add(function() {
			for (var i=elements.length; i--; )
				if (!elements[i].isDead())
					elements[i].tick();
			for (var i=Plant.dead; i--; )
				elements.push(new Plant().configure());
			Plant.dead = 0;
		});
	}

	var Timer = new Event();
	Timer.step = 100;
	Timer.interval = setInterval(Timer.fire.bind(Timer), Timer.step);
	Event.add(document, 'click', function(event) {
		if (Timer.interval) {
			clearInterval(Timer.interval);
			Timer.interval = false;
		} else {
			Timer.interval = setInterval(Timer.fire.bind(Timer), Timer.step);
		}
	});
	Event.add(document, 'dblclick', function() {
		var div = Logger.div;
		if (div.className == "Logger-div Logger-hidden") {
			div.innerHTML = Logger.getLog();
			div.scrollTop = div.scrollHeigth;
			div.className = "Logger-div Logger-visible";
		} else {
			div.className = "div Logger-hidden";
		}
		//Timer.fire();
	});

	Event.onReady.add(Main);
})();
