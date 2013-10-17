// Possible strict violation, using this on a non-method function
//jshint -W040

define(function(require) {
	'use strict';
	var nativePool = require('core/memory-pool');

	function objectDispose() {
		for (var i in this)
			if (this.hasOwnProperty(i))
				delete this[i];
	}

	function arrayDispose() {
		this.length = 0;
	}

	var pools = {
		'OBJECT': nativePool(Object, function() { return {} }, objectDispose),
		'ARRAY': nativePool(Array, function() { return [] }, arrayDispose),
	};

	function add(pool) {
		pools[pool.$type] = pool;
	}

	function resource(key) {
		if (!pools[key])
			throw new Error('Unkown memory item --[' + key + ']--');

		return pools[key];
	}

	function dispose(item) {
		item.dispose();
	}

	function disposeAll() {
		for (var i = arguments.length; i--;)
			arguments[i].dispose();
	}

	return {
		add: add,
		resource: resource,
		dispose: dispose,
		disposeAll: disposeAll,
	};
});
