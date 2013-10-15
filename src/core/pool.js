define(function(require) {
	'use strict';

	/*
	function wrapDispose(original, pool) {
		return function() {
			if (original) original.call(this);
			pool.disposeItem(this);
		};
	}
	*/

	var type = require('core/type');

	var pool = type({

		$type: 'POOL',

		init: function(id, creator, init) {
			console.log('Creating pool', id);
			this.pool = [];
			this.id = id;
			this.creator = creator;
			this.initializer = init;
			return this;
		},

		create: function() {
			var item = this.creator.apply(null, arguments);
			//item.dispose = wrapDispose(item.dispose, this);
			return item;
		},

		get: function() {
			var item = this.pool.length ?
				this.pool.pop() :
				this.create.apply(this, arguments);

			if (this.initializer)
				this.initializer(item);

			item.init.apply(item, arguments);
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
