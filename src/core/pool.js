define(function(require) {
	'use strict';

	var type = require('core/type');

	function wrapDispose(original, pool) {
		return function() {
			if (original) original.call(this);
			pool.disposeItem(this);
		};
	}

	var pool = type({

		init: function(id, creator, init) {
			this.pool = [];
			this.id = id;
			this.creator = creator;
			this.initializer = init;
			return this;
		},

		create: function() {
			var item = this.creator.apply(null, arguments);
			item.dispose = wrapDispose(item.dispose, this);
			return item;
		},

		get: function() {
			var item = this.pool.length ?
				this.pool.pop() :
				this.create.apply(this, arguments);

			item.constructor.apply(item, arguments);
			return item;
		},

		disposeItem: function(item) {
			this.pool.push(item);
		},

		count: function() {
			return this.pool.length;
		}
	});

	return pool;
});
