//jshint unused:false

define(function(require) {
	'use strict';

	var canvas = require('renderers/canvas');
	var renderer = canvas.new(document.querySelector('canvas'));
	renderer.width = document.documentElement.clientWidth;
	renderer.height = document.documentElement.clientHeight;

	var vector = require('physics/vector');
	var element = require('physics/physic');

	var pepe = element.new(vector(150, 150), 20);
	pepe.movement.strength = 100;
	pepe.movement.direction = 30;
	renderer.drawElement(pepe);
});
