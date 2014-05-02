define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var Map = require('map/map');

	function Game() {
		this.contanier = null;
		this.types = {};
		this.entities = [];
		this.map = new Map();

		Object.defineProperties(this, descriptors({
			_onEntityDie: this._onEntityDie.bind(this),
			_onEntityReproduce: this._onEntityReproduce.bind(this),
		}));
	}

	Game.prototype = {
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
	};

	Object.defineProperties(Game.prototype, descriptors({
		_onEntityDie: function(entity) {
			this.dead.push(entity);
			//this.remove(entity);
			if (this.onEntityDie)
				this.onEntityDie(entity);
		},
		_onEntityReproduce: function(children, parent) {
			this.children.push(children);

			for (var i = 0; i < children.length; i++)
				children[i].$entityType = parent.$entityType;

			if (this.onEntityReproduce)
				this.onEntityReproduce(children, parent);
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

		_newEntity: function(entity) {
			entity.onDie = this._onEntityDie;
			entity.onReproduce = this._onEntityReproduce;
			this.entities.push(entity);
			return entity;
		},

		spawn: function(id, position, diameter) {
			var Type = this.types[id];
			var entity = new Type(position, diameter);
			entity.$entityType = id;
			return this._newEntity(entity);
		},

		remove: function(entity) {
			var index = this.entities.indexOf(entity);
			if (index === -1) return false;
			this.entities.slice(index, 1);
			return true;
		},

		tick: function() {
			this.tickEntities();
			this.roundMap();
			this.render();
			//Vector.logDebugData();
		},

		tickEntities: function() {
			this.dead = [];
			this.children = [];
			var entities = this.entities.slice();

			for (var i = 0, len = entities.length; i < len; i++) {
				this.map.entities = this.entities;

				if (entities[i].isAlive)
					entities[i].tick(this.map);
			}

			this.removeDead(this.dead);
			this.addChildren(this.children);
			this.children = null;
			this.dead = null;
		},

		addChildren: function(children) {
			children = Array.prototype.concat.apply([], children);

			for (var i = 0, len = children.length; i < len; i++) {
				if (children[i])
					this._newEntity(children[i]);
			}
		},

		removeDead: function() {
			var entities = this.entities;
			var alive = [];

			for (var i = 0, len = entities.length; i < len; i++) {
				if (!entities[i].isDisposed && !entities[i].isDead)
					alive.push(entities[i]);
				else
					entities[i].dispose();
			}

			this.entities = alive;
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
	}));

	return Game;
});
