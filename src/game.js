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
			this.onEntityDie = this.onEntityDie.bind(this);
			this.onEntityReproduce = this.onEntityReproduce.bind(this);
		},

		onEntityDie: function(entity) {
			this.remove(entity);
		},
		onEntityReproduce: function(children) {
			this.children.push.apply(this.children, children);
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
			entity.onDie = this.onEntityDie;
			entity.onEntityReproduce = this.onEntityReproduce;
			this.entities.push(entity);
			return entity;
		},

		remove: function(entity) {
			var index = this.entities.indexOf(entity);
			if (index === -1) return false;
			this.entities.slice(index, 1);
			return true;
		},

		tick: function() {
			this.tickEntities();
			this.removeDead();
			this.roundMap();
			this.render();
		},

		tickEntities: function() {
			this.children = array.new();
			var entities = array.new();
			entities.push.apply(entities, this.entities);

			for (var i = 0, len = entities.length; i < len; i++) {
				this.map.entities = this.entities;

				if (entities[i].isAlive)
					entities[i].tick(this.map);
			}

			entities.dispose();
			this.addChildren(this.children);
			this.children.dispose();
		},

		addChildren: function(children) {
			for (var i = 0, len = children.length; i < len; i++) {
				if (!children[i]) continue;
				this.entities.push.apply(this.entities, children[i]);
				children[i].dispose();
			}
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

		roundMap: function() {
			for (var i = 0, len = this.entities.length; i < len; i++)
				this.map.round(this.entities[i]);
		},

		render: function() {
			this.renderer.clear();
			for (var i = 0, len = this.entities.length; i < len; i++)
				this.renderer.drawEntity(this.entities[i]);
		}
	});

	return game;
});
