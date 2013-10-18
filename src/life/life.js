define(function(require) {
	'use strict';

	var memory = require('core/memory');
	var type = require('core/type');
	var physic = require('physics/physic');
	var array = memory.resource('ARRAY');

	var life = type(physic, {

		$type: 'LIFE',

		get isDead() {
			return !this.isAlive;
		},

		init: function(location, diameter) {
			var id = this.id;
			physic.init.call(this, location, diameter);
			id ? console.log(id, 'reencarnated into', this.id) : console.log(this.id, 'HAS BORN');
			this.parents = array.new();
			this.isAlive = true;
		},

		dispose: function() {
			console.log(this.id, 'IS DEAD');
			physic.dispose.call(this);
			this.parents.dispose();
			this.parents = null;
		},

		tick: function() {
			if (this.isDead)
				throw new Error('Dead life form can\'t tick');

			physic.tick.call(this);
		},

		die: function() {
			if (this.isDead) return;
			if (this.onDie) this.onDie();
			this.isAlive = false;
			this.dispose();
		},

		setParents: function() {
			for (var i = 0, len = arguments.length; i < len; i++)
				this.parents.push(arguments[i]);
		},

		isParent: function(target) {
			return target.parents.indexOf(this) !== -1;
		},

		isSibiling: function(target) {
			for (var i = 0, len = this.parents.length; i < len; i++)
				if (target.parents.indexOf(this.parents[i]) !== -1)
					return true;
		},

		isFamily: function(target) {
			return target.isParent(this) ||
				this.isParent(target) ||
				this.isSibiling(target);
		}
	});

	return life;
});
