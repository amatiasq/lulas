// Possible strict violation, using this on a non-method function
//jshint -W040

define(function(require) {
	'use strict';
	var proto = require('core/memory-prototypes');
	var memoryPool = require('core/memory-pool');

	function objectDispose() {
		for (var i in this)
			if (this.hasOwnProperty(i))
				delete this[i];
		this.dispos = objectDispose;
	}

	function arrayDispose() {
		this.length = 0;
		this.dispose = arrayDispose;
	}

	var pools = {
		'OBJECT': memoryPool.new(Object, function() { return {} }, objectDispose),
		'ARRAY': memoryPool.new(Array, function() { return [] }, arrayDispose),
	};

	function add(pool) {
		pools[pool.represents] = pool;
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
