//jshint unused:false

define(function(require) {
	'use strict';

	var memoryPool = {

		new: function() {
			var child = Object.create(this);
			child.init.apply(child, arguments);
			return child;
		},

		init: function(id, creator) {
			console.log('Creating pool', id);
			this.pool = [];
			this.creator = creator;
		},

		get: function() {
			var item = this.pool.length ?
				this.pool.pop() :
				this.creator.apply(null, arguments);

			return item;
		},

		disposeItem: function(item) {
			this.pool.push(item);
		},
	};

	return memoryPool;
});
