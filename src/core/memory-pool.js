define(function() {
	'use strict';

	var memoryPool = {

		new: function() {
			var child = Object.create(this);
			child.init.apply(child, arguments);
			return child;
		},

		init: function(Constructor, creator, disposer) {
			console.log('Creating pool', Constructor.name.toUpperCase());
			this.pool = [];
			this.ctor = Constructor;
			this.creator = creator;
			this.disposer = disposer;
			this.new = this.get.bind(this);
		},

		isPrototypeOf: function(value) {
			return value instanceof this.ctor;
		},

		get: function() {
			return this.pool.length ?
				this.pool.pop() :
				this.creator();
		},

		disposeItem: function(item) {
			this.disposer.call(item);
			this.pool.push(item);
		},
	};

	return memoryPool;
});
