define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var type = require('core/type');
	var object = memory.resource('OBJECT');

	function calcColor(base) {
		return isNaN(base) ? Math.round(Math.random() * 128) : base;
	}

	var canvas = type({

		$type: 'CANVAS',

		get width() {
			return this.canvas.width;
		},
		set width(value) {
			this.canvas.width = value;
		},
		get height() {
			return this.canvas.height;
		},
		set height(value) {
			this.canvas.height = value;
		},

		colors: [ 'r', 'g', 'b'],

		init: function() {
			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');
		},

		append: function(parent) {
			parent.appendChild(this.canvas);
		},
		remove: function() {
			this.canvas.parentElement.removeChild(this.canvas);
		},

		generateColor: function(entity) {
			entity.color = 'rgb(' +
				calcColor(entity.baseColor.r) + ',' +
				calcColor(entity.baseColor.g) + ',' +
				calcColor(entity.baseColor.b) + ')';
		},

		drawEntity: function(entity) {
			if (!entity.color)
				this.generateColor(entity);

			this.drawItem(entity.location, entity.radius, entity.movement.vector, entity.color);
		},

		drawItem: function(position, radius, movement, color) {
			var context = this.context;

			context.save();
			context.fillStyle = color;
			context.translate(position.x, position.y);

			context.beginPath();
			context.arc(0, 0, radius, 0, Math.PI * 2);
			context.fill();
			//context.stroke();

			if (movement.hypotenuse !== 0)
			{
				context.beginPath();
				context.moveTo(0, 0);
				context.lineTo(movement.x, movement.y);
				context.stroke();

				context.fillStyle = 'blue';
				context.translate(movement.x, movement.y);
				context.arc(0, 0, 2, 0, Math.PI * 2);
				context.fill();
			}

			context.restore();
		},

		clear: function() {
			this.context.clearRect(0, 0, this.width, this.height);
		}
	});

	return canvas;
});
