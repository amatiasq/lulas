define(function(require) {
	'use strict';

	var extend = require('core/extend');

	function type(descriptor, parent) {
		if (parent)
			descriptor = extend(Object.create(parent), descriptor);

		function ctor() {}
		ctor.prototype = descriptor;
		return ctor;
	}

	return type;
});
