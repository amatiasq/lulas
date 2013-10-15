//jshint unused:false

define(function(require) {
	'use strict';

	var type = require('core/type');

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

		init: function(element) {
			this.canvas = element;
			this.context = element.getContext('2d');
		},

		drawElement: function(element) {
			this.drawItem(element.location, element.radius, element.movement.vector);
		},

		drawItem: function(position, radius, movement) {
			var context = this.context;

			context.save();
			//context.fillStyle = element.color;
			console.log('moving to ' + position);
			context.translate(position.x, position.y);

			context.beginPath();
			context.arc(0, 0, radius, 0, Math.PI * 2);
			context.fill();
			//context.stroke();

			//if (!movement.hipotenuse !== 0)
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
