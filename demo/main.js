//jshint maxstatements:30

define(function(require) {
	'use strict';
	var Vector = window.Vector = require('physics/vector');
	var Plant = require('life/plant');
	var Herbivore = require('life/herbivore');
	var Carnivore = require('life/carnivore');
	var Game = require('game');
	var CanvasRenderer = require('renderers/canvas')

	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;

	var game = Game.new();
	game.container = document.body;
	game.renderer = CanvasRenderer.new();
	game.height = height;
	game.width = width;

	game.addEntityType('PLANT', Plant);
	game.addEntityType('HERBIVORE', Herbivore);
	game.addEntityType('CARNIVORE', Carnivore);

	function rand(max, min) {
		min = min || 0;
		return (Math.random() * (max - min) | 0) + min;
	}

	var i;
	for (i = 1; i--;)
		game.spawn('PLANT', Vector.new(rand(width), rand(height)), rand(10, 5));

	for (i = 1; i--;)
		game.spawn('HERBIVORE', Vector.new(rand(width), rand(height)), rand(10, 5));

	for (i = 1; i--;)
		game.spawn('CARNIVORE', Vector.new(rand(width), rand(height)), rand(15, 10));

	game.entities.forEach(function(entity) {
		var direction = rand(360);
		console.log(direction);
		entity.shove(direction, rand(100));
	});

	window.game = game;
	game.tick();

	setInterval(game.tick.bind(game), 1000 / 1);

	/*
	setInterval(function() {
		game.spawn('PLANT', vector(rand(width), rand(height)), rand(10, 5));
	}, 10);
	*/
});
