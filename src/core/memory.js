// Possible strict violation, using this on a non-method function
//jshint -W040

define(function(require) {
	'use strict';
	var proto = require('core/memory-prototypes');
	var pool = require('core/memory-pool');

	function objectDispose() {
		for (var i in this)
			if (this.hasOwnProperty(i))
				delete this[i];
	}

	function arrayDispose() {
		this.length = 0;
	}

	var pools = {

		'Object': pool.new('Object', function() {
			return {
				dispose: objectDispose,
			};
		}),

		'Array': pool.new('Array', function() {
			var item = [];
			item.dispose = arrayDispose;
			return item;
		})
	};

	function add(key, pool) {
		pools[key] = pool;
	}

	function resource(key) {
		if (!pools[key])
			throw new Error('Unkown memory item --[' + key + ']--');

		return pools[key];
	}

	return {
		proto: proto,
		add: add,
		resource: resource,
	};
});
