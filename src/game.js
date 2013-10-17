define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var type = require('core/type');

	var map = require('map/map');
	var array = memory.resource('ARRAY');

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

		get width() {
			return this.map.width;
		},
		set width(value) {
			this.map.width = value;
			this.renderer.width = value;
		},
		get height() {
			return this.map.height;
		},
		set height(value) {
			this.map.height = value;
			this.renderer.height = value;
		},

		init: function() {
			this.contanier = null;
			this.types = {};
			this.entities = array.new();
			this.map = map.new();
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
			var children = this.tickEntities();
			this.addChildren(children);
			this.removeDead();
			this.render();
		},

		tickEntities: function() {
			var children = array.new();
			this.map.entities = this.entities;

			for (var i = 0, len = this.entities.length; i < len; i++)
				children.push(this.entities[i].tick(this.map));

			return children;
		},

		addChildren: function(children) {
			for (var i = 0, len = children.length; i < len; i++) {
				if (!children[i]) continue;

				this.entities.push.apply(this.entities, children[i]);
				children[i].dispose();
			}

			children.dispose();
		},

		removeDead: function() {
			var entities = this.entities;
			var alive = array.new();

			for (var i = 0, len = entities.length; i < len; i++)
				if (!entities[i].isDisposed)
					alive.push(entities[i]);

			this.entities = alive;
			entities.dispose();
		},

		render: function() {
			this.renderer.clear();
			for (var i = 0, len = this.entities.length; i < len; i++)
				this.renderer.drawEntity(this.entities[i]);
		}
	});

	return game;
});
