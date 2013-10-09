define(function() {
	'use strict';

	function extend(target, source) {
		var descriptors = {};
		Object.keys(source).forEach(function(key) {
			descriptors[key] = Object.getPropertyDescriptor(source, key);
		});
		Object.defineProperties(target, descriptors);
		return target;
	}

	return extend;
});
