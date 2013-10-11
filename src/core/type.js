define(function(require) {
	'use strict';

	var proto = require('core/memory').proto;
	var extend = require('core/extend');

	function type(parent, descriptor) {
		descriptor = arguments.length === 2 ?
			extend(proto(parent), descriptor) :
			parent;

		descriptor.new = function() {
			var child = proto(descriptor);
			child.init.apply(child, arguments);
			return child;
		};

		return descriptor;
	}

	return type;
});
