define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var type = require('core/type');
	var animal = require('life/animal');
	var array = memory.resource('ARRAY');

	var cell = type(animal, {

		$type: 'CELL',

		init: function(location, diameter) {
			animal.init.call(this, location, diameter);
			this.factor['reproduce at size'] = 200;
			this.factor['mitosis split velocity'] = 5;
		},

		canReproduce: function() {
			return this.area > this.factor['reproduce at size'];
		},

		reproduce: function() {
			var child1 = this._createChild();
			var child2 = this._createChild();
			var direction = Math.round(Math.random() * 360);
			var strength = this.factor['mitosis split velocity'];

			child1.shove(direction, strength);
			child2.shove(direction + 180, strength);

			var children = array.new();
			children[0] = child1;
			children[1] = child2;
			if (this.onReproduce) this.onReproduce(children);
			children.dispose();

			this.die();
		},

		_createChild: function() {
			var child = this.new(this.location, this.radius);
			child.setParents(this);
			return child;
		}
	});

	return cell;
});
