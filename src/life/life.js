define(function(require) {
	'use strict';
	var descriptors = require('core/descriptors');
	var extend = require('core/extend');
	var Element = require('map/element');
	var Physic = require('physics/physic');

	function getId(item) {
		return item.id;
	}

	function idHashmap(map, item) {
		map[item.id] = true;
		return map;
	}

	function Life(location, diameter, parents) {
		var id = this.id;
		Element.call(this, location, diameter);
		Physic.call(this);

		if (this.log) {
			id ?
				console.log(id, 'reencarnated into', this.id) :
				console.log(this.id, 'HAS BORN AS', this.$type);
		}

		this.parents = parents ? parents.reduce(idHashmap, {}) : {};
		this.parentArray = parents ? parents.map(getId) : [];
		this.isAlive = true;
	}

	extend(Life.prototype, Element.prototype, Physic.prototype, {
		get isDead() {
			return !this.isAlive;
		},
	});

	Object.defineProperties(Life.prototype, descriptors({
		log: false,

		dispose: function() {
			if (this.log)
				console.log(this.id, 'IS DEAD');

			Physic.prototype.dispose.call(this);
			Element.prototype.dispose.call(this);
			this.parents = null;
		},

		tick: function() {
			if (this.isDead)
				throw new Error('Dead life form can\'t tick');

			this.move();
		},

		move: function() {
			this.location = this.location.merge(this.movement);
		},

		die: function() {
			if (this.isDead) return;
			if (this.onDie) this.onDie(this);
			this.isAlive = false;
		},

		isParent: function(target) {
			return target.parents[this.id];
		},

		isSibiling: function(target) {
			for (var i = 0, len = this.parentArray.length; i < len; i++)
				if (target.parents[this.parentArray[i]])
					return true;
		},

		isFamily: function(target) {
			return target.isParent(this) ||
				this.isParent(target) ||
				this.isSibiling(target);
		}
	}));

	return Life;
});
