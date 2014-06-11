//jshint maxstatements:30

define(function(require) {
	'use strict';
	var Vector = window.Vector = require('physics/vector');
	var Plant = require('life/plant');
	var Herbivore = require('life/herbivore');
	var Carnivore = require('life/carnivore');
	var Game = require('game');
	var Ticker = require('ticker');
	var CanvasRenderer = require('renderers/canvas');

	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;

	var game = new Game();
	game.container = document.body;
	game.renderer = new CanvasRenderer();
	game.height = height;
	game.width = width;

	game.addEntityType('PLANT', Plant);
	game.addEntityType('HERBIVORE', Herbivore);
	game.addEntityType('CARNIVORE', Carnivore);

	game.onEntityDie = function(entity) {
		if (entity.$entityType === 'PLANT')
			game.spawn('PLANT', new Vector(rand(width), rand(height)), rand(10, 5));
	};

	function rand(max, min) {
		min = min || 0;
		return (Math.random() * (max - min) | 0) + min;
	}

	var i;
	for (i = 10; i--;)
		game.spawn('PLANT', new Vector(rand(width), rand(height)), rand(10, 5));

	for (i = 5; i--;)
		game.spawn('HERBIVORE', new Vector(rand(width), rand(height)), rand(10, 5));

	for (i = 3; i--;)
		game.spawn('CARNIVORE', new Vector(rand(width), rand(height)), rand(15, 10));

	game.entities.forEach(function(entity) {
		var direction = rand(360);
		entity.shove(direction, rand(100));
	});


	var fps = document.querySelector('.fps');

	var lastLog = Date.now();
	var lastTick = Date.now();
	var ticker = new Ticker(function(iteration) {
		var now = Date.now();

		if (!(iteration % 100)) {
			console.log(iteration, game.entities.length, (now - lastLog) / 1000);
			lastLog = now;
		}

		var diff = now - lastTick;
		fps.innerText = iteration + ' - ' + (1000 / diff);
		lastTick = now;

		game.tick();
		window.DEBUG = false;
	});

	document.addEventListener('click', ticker.toggle.bind(ticker));
	ticker.start();
	window.game = game;
});
