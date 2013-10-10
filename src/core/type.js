define(function(require) {
	'use strict';

	var extend = require('core/extend');

	function type(parent, descriptor) {
		descriptor = arguments.length === 2 ?
			extend(Object.create(parent), descriptor) :
			parent;

		descriptor.new = function() {
			var child = Object.create(descriptor);
			child.init.apply(child, arguments);
			return child;
		};

		return descriptor;
	}

	return type;
});
