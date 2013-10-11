// Possible strict violation, using this on a non-method function
//jshint -W040

define(function(require) {
	'use strict';

	var pool = require('core/pool');

	function objectDispose() {
		for (var i in this)
			if (this.hasOwnProperty(i))
				delete this[i];
	}

	var keys = [ ];
	var values = [ ];
	var idProp = '__memory_id__';

	function invoke(original, dispose, toPool) {
		if (original)
			original.call(this);

		dispose.call(this);
		toPool.call(this);
	}

	function defineProp(base) {
		var index = keys.length;
		var creator = Object.create.bind(Object, base);
		var basePool = pool.new('MEMORY_' + index, creator);

		base[idProp] = index;
		keys.push(base);
		values[index].push(basePool);

		var poolDispose = basePool.disposeItem.bind(basePool);
		base.dispose = invoke(base.dispose, objectDispose, poolDispose);
	}

	function proto(base) {
		var index = base[idProp] != null ? base[idProp] : defineProp(base);
		var pool = values[index];
		return pool.get();
	}

	return proto;
});
