define(function() {
	'use strict';

	function extend(target) {
		var descriptors = {};
		var sources = Array.prototype.slice.call(arguments, 1);

		sources.forEach(function(source) {
			Object.keys(source).forEach(function(key) {
				descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
			});
		});

		Object.defineProperties(target, descriptors);
		return target;
	}

	return extend;
});
