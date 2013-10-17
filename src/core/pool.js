// Possible strict violation
//jshint -W040

define(function() {
	'use strict';

	function Pool(source) {
		var pool = [];
		var type = Object.create(source);
		console.log('Creating pool', type.$type);

		function dispose() {
			if (type.dispose)
				type.dispose.call(this);
			pool.push(this);
		}

		function create() {
			var item = Object.create(type);
			item.dispose = dispose;
			return item;
		}

		type.new = function() {
			var item = pool.length ? pool.pop() : create();
			item.init.apply(item, arguments);
			return item;
		};

		return type;
	}

	return Pool;
});
