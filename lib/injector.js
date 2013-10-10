define(function(require) {
	var stubbed = [];

	function undef(name) {
		stubbed.push(name);
		requirejs.undef(name);
	}

	function stub(name, implementation) {
		undef(name);
		define(name, [], function() {
			return implementation;
		});
	}

	function load(name, callback) {
		undef(name);
		require([name], callback);
	}

	function loadTest(name, callback) {
		return function(done) {
			var context = this;
			undef(name);
			require([name], function(value) {
				callback.call(context, value);
				done();
			});
		};
	}

	function reset() {
		stubbed.forEach(function(name) {
			requirejs.undef(name);
		});
		stubbed = [];
	}

	return {
		stub: stub,
		load: load,
		reset: reset,
		loadTest: loadTest,
	};
});
