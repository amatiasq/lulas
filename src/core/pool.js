define(function(require) {
	'use strict';

	function wrapDispose(original, pool) {
		return function() {
			if (original) original.call(this);
			pool.disposeItem(this);
		};
	}

	var proto = require('core/memory').proto;
	var type = require('core/type');

	var pool = type({

		$type: 'POOL',

		get represents() {
			return this.type.$type;
		},

		init: function(type) {
			console.log('Creating pool', type.$type);
			this.pool = [];
			this.type = type;
			this.new = this.get.bind(this);
			return this;
		},

		isPrototypeOf: function(value) {
			return this.type.isPrototypeOf(value);
		},

		create: function() {
			var item = proto(this.type);
			item.dispose = wrapDispose(item.dispose, this);
			return item;
		},

		get: function() {
			var item = this.pool.length ?
				this.pool.pop() :
				this.create();

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
