//jshint unused:false

define(function(require) {
	'use strict';

	var vector = require('physics/vector');
	var physic = require('physics/physic');

	var renderer = require('renderers/canvas').new();
	renderer.width = document.documentElement.clientWidth;
	renderer.height = document.documentElement.clientHeight;

	var game = require('game').new();
	game.container = document.body;
	game.renderer = renderer;
	game.addEntityType('BASIC', physic);

	var pepe = game.spawn('BASIC', vector(100, 100), 10);
	pepe.movement.strength = 100;
	pepe.movement.direction = 30;

	window.game = game;
	game.tick();
});
