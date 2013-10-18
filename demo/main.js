//jshint maxstatements:30

define(function(require) {
	'use strict';

	var width = document.documentElement.clientWidth;
	var height = document.documentElement.clientHeight;

	var memory = require('core/memory');
	var vector = window.vector = require('physics/vector');

	require('life/plant');
	require('life/herbivore');
	require('life/carnivore');

	var game = require('game').new();
	game.container = document.body;
	game.renderer = require('renderers/canvas').new();
	game.width = width;
	game.height = height;

	game.addEntityType('PLANT', memory.resource('PLANT'));
	game.addEntityType('HERBIVORE', memory.resource('HERBIVORE'));
	game.addEntityType('CARNIVORE', memory.resource('CARNIVORE'));

	function rand(max, min) {
		min = min || 0;
		return Math.round(Math.random() * (max - min)) + min;
	}

	var i;
	for (i = 10; i--;)
		game.spawn('PLANT', vector(rand(width), rand(height)), rand(10, 5));

	for (i = 5; i--;)
		game.spawn('HERBIVORE', vector(rand(width), rand(height)), rand(10, 5));

	for (i = 1; i--;)
		game.spawn('CARNIVORE', vector(rand(width), rand(height)), rand(15, 10));

	window.game = game;
	game.tick();
	setInterval(game.tick.bind(game), 1000 / 20);

	setInterval(function() {
		game.spawn('PLANT', vector(rand(width), rand(height)), rand(10, 5));
	}, 10);
});
