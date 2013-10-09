define(function(require) {
	'use strict';

	var type = require('core/type');

	var Pool = type({

		init: function(id, creator) {
			this.pool = [];
			this.id = id;
			this.creator = creator;
		},

		create: function() {
			var item = this.creator();
			item.dispose = this.dispose.bind(this, item);
			return item;
		},

		get: function() {
			var item = this.pool.length ?
				this.pool.pop() :
				this.create();

			item.init.apply(item, arguments);
			return item;
		},

		dispose: function(item) {
			this.pool.push(item);
		}
	});

	return function pool(type, creator) {
		return new Pool(type, creator);
	};
});
