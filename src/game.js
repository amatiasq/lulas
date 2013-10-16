define(function(require) {
	'use strict';

	var type = require('core/type');

	var game = type({

		get renderer() {
			return this._renderer;
		},
		set renderer(value) {
			if (this._renderer)
				this._renderer.remove();

			value.append(this.container);
			this._renderer = value;
		},

		init: function() {
			this.contanier = null;
			this.types = {};
			this.entities = [];
		},

		addEntityType: function(id, type) {
			this.types[id] = type;
		},

		removeEntityType: function(id) {
			delete this.types[id];
			this.entities = this.entities.filter(function(item) {
				return item.$entityType !== id;
			});
		},

		spawn: function(id, position, diameter) {
			var type = this.types[id];
			var entity = type.new(position, diameter);
			entity.$entityType = id;
			this.entities.push(entity);
			return entity;
		},

		tick: function() {
			var i, len;

			for (i = 0, len = this.entities.length; i < len; i++)
				this.entities[i].tick();

			this.renderer.clear();
			for (i = 0, len = this.entities.length; i < len; i++)
				this.renderer.drawEntity(this.entities[i]);
		}
	});

	return game;
});
