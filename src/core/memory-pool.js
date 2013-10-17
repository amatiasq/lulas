// Possible strict violation
//jshint -W040

define(function() {
	'use strict';

	function MemoryPool(Constructor, creator, disposer) {
		var pool = [];

		function dispose() {
			disposer.call(this);
			pool.push(this);
		}

		function create() {
			var item = pool.length ? pool.pop() : creator();
			item.dispose = dispose;
			return item;
		}

		function isPrototypeOf(object) {
			return object instanceof this.ctor;
		}

		return {
			new: create,
			isPrototypeOf: isPrototypeOf,
		};
	}

	return MemoryPool;
});
