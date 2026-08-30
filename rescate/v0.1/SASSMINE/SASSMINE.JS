(function(global) {
	/*
	 * Helpers
	 */
	var undefined;
	function Div(parent) {
		return parent.appendChild(document.createElement("div"));
	}

	/*
	 * Classes
	 */
	function ExpectationContainer(msg, funct, parent, hide, cssClass) {
		this.dom = new Div(parent);
		this.failed = false;
		this.fails = [];
		this.hide = hide;
		this.message = msg;
		this.funct = funct;
		this.dom.className = cssClass;
		this.dom.innerHTML = msg;
	}
	function Suite(msg, suite, parent, hide) {
		ExpectationContainer.call(this, msg, suite, parent, hide, "sassmineSuite");
		this.suites = [];
		this.specs = [];
	}
	function Spec(msg, spec, parent, hide) {
		ExpectationContainer.call(this, msg, spec, parent, hide, "sassmineSpec");
	}

	/*
	 * Expectations
	 */
	function Expectation(target, not) {
		this.target = target;
		this.isNot = (not != undefined);
		if (!this.isNot)
			this.not = new Expectation(target, true);
	}
	var proto = Expectation.prototype;
	proto.test_ = function(bool, message) {
		if (bool !== this.isNot)
			return;
		current.failed = true;
		current.fails.push(message.replace("[NOT] ", this.isNot ? "not " : ""));
	};
	proto.toBe = function(objetive) {
		this.test_(this.target === objetive,
			"Expected --[" + this.target + "]-- (" + (typeof this.target) +
			") to [NOT] be --[" + objetive + "]-- (" + (typeof objetive) + ")");
	};
	proto.toBeLike = function(objetive) {
		this.test_(this.target == objetive,
			"Expected --[" + this.target + "]-- (" + (typeof this.target) +
			") to [NOT] be --[" + objetive + "]-- (" + (typeof objetive) + ")");
	};
	proto.toBeTrue = function() {
		this.test_(this.target === true,
			"Expected --[" + this.target + "]-- to [NOT] be --[true]--");
	};
	proto.toBeFalse = function() {
		this.test_(this.target === false,
			"Expected --[" + this.target + "]-- to [NOT] be --[true]--");
	};
	proto.toBeTruthy = function() {
		this.test_(!!this.target,
			"Expected --[" + this.target + "]-- to [NOT] be truthy");
	};
	proto.toBeFalsy = function() {
		this.test_(!this.target,
			"Expected --[" + this.target + "]-- to [NOT] be falsy");
	};
	proto.toBeNull = function() {
		this.test_(this.target === null,
			"Expected --[" + this.target + "]-- to [NOT] be null");
	};
	proto.toBeUndefined = function() {
		this.test_(typeof this.target === 'undefined',
			"Expected --[" + this.target + "]-- to [NOT] be undefined");
	};
	proto.toBeNaN = function() {
		this.test_(isNaN(this.target),
			"Expected --[" + this.target + "]-- to [NOT] be NaN");
	};
	proto.toBeBetween = function(min, max) {
		this.test_(this.target > min && this.target < max,
			"Expected --[" + this.target + "]-- to [NOT] be between --[" +
				min + "]-- and --[" + max + "]--");
	};
	proto.toBeLowerThan = function(num) {
		this.test_(this.target < num,
			"Expected --[" + this.target + "]-- to [NOT] be lower than --[" + num + "]--");
	};
	proto.toBeBiggerThan = function(num) {
		this.test_(this.target > num,
			"Expected --[" + this.target + "]-- to [NOT] be bigger than --[" + num + "]--");
	};
	proto.toBePositive = function() {
		this.test_(this.target > 0,
			"Expected --[" + this.target + "]-- to [NOT] be positive");
	};
	proto.toBeNegative = function() {
		this.test_(this.target < 0,
			"Expected --[" + this.target + "]-- to [NOT] be negative");
	};
	proto.toBeArray = function() {
		this.test_(Object.prototype.toString.call(this.target) == "[object Array]",
			"Expected --[" + this.target + "]-- to [NOT] be a Array");
	};
	proto.toBeFunction = function() {
		this.test_(this.target instanceof Function,
			"Expected --[" + this.target + "]-- to [NOT] be a function");
	};
	proto.toBeInstanceOf = function(targetClass) {
		this.test_(this.target instanceof targetClass,
			"Expected --[" + this.target + "]-- to [NOT] be instance of --[" +
			targetClass + "]--");
	};
	proto.toHaveProperty = function(propertyName) {
		this.test_(propertyName in this.target,
			"Expected --[" + this.target + "]-- to [NOT] have property --[" +
			propertyName + "]--");
	};
	proto.toThrow = function(errorClass) {
		try {
			this.target.call(global);
			this.test_(false, "Expected --[" + this.target + "]-- to [NOT] throw a exception");
		} catch (ex) {
			alert(ex.constructor);
			this.test_(ex instanceof errorClass,
				"Expected --[" + this.target + "]-- to [NOT] throw --[" + errorClass +
				"]-- but --[" + ex + "]-- thrown");
		}
	};
	proto.toThrowError = function() {
		try {
			this.target.call(global);
			this.test_(false, "Expected --[" + this.target + "]-- to [NOT] throw a exception");
		} catch (ex) {
			this.test_(true,
				"Expected --[" + this.target + "]-- to [NOT] throw error but --["
				+ ex + "]-- thrown with message --[" + ex.message + "]--");
		}
	};

	/*
	 * Spies
	 */
	function Spy(original, callOriginal) {
		this.reset();
		this.newSpy();
		this.original = original;
		this.callOriginal = callOriginal;
	}
	Spy.prototype.reset = function() {
		this.callCount = 0;
		this.scopes = [];
		this.arguments = [];
		this.lastScope = null;
		this.lastArguments = [];
	};
	Spy.prototype.newSpy = function() {
		var self = this;
		this.spy = function() {
			self.callCount++;
			self.scopes.push(this);
			var args = [];
			for (var i=0, len=arguments.length; i<len; i++)
				args.push(arguments[i]);
			self.arguments.push(args);
			self.lastScope = this;
			self.lastArguments = args;
			if (self.callOriginal)
				self.original.call(self.object, arguments);
		};
	};

	/*
	 * variables
	 */
	var container = document.createElement("div"),
		button = document.createElement("button"),
		tree = new Suite("", function() { }, container),
		current = tree,
		suitesCount = 0,
		specsCount = 0;
	current.dom.className = "sassmine";
	button.innerHTML = "Ver Todos";
	container.appendChild(button);
	button.onclick = function() {
		var hide = /sassmineHide/,
			divs = document.getElementsByTagName("div"),
			i = divs.length;
		while (i--)
			divs[i].className = divs[i].className.replace(hide, "");
	};

	/*
	 * functions
	 */
	function block_(msg, funct, struct, hide) {
		var last = current;
		if (last.beforeEach)
			last.beforeEach();
		current = new struct(msg, funct, last.dom, hide || last.hide);
		try {
			var result = current.funct.call(global);
		} catch(ex) {
			current.failed = true;
			current.fails.push(ex.message);
		}
		if (current.failed) {
			current.dom.className += " sassmineFailed";
			if (current.fails.length > 0) {
				var messages = new Div(current.dom);
				messages.className = "sassmineErrorMessages";
				messages.innerHTML = current.fails.join("<br />");
			}
			last.failed = true;
		} else if (current.hide && (!global.forceShow)) {
			current.dom.className += " sassmineHide";
		}
		last.suites.push(current);
		if (last.afterEach)
			last.afterEach();
		current = last;
	}
	function xdescribe(msg, suite, hide) { };
	function describe(msg, suite, hide) {
		suitesCount++;
		block_(msg, suite, Suite, hide);
		document.title = "Executed " + suitesCount +
					   " suites with " + specsCount + " specs.";
	}
	function xit(msg, spec, hide) { }
	function it(msg, spec, hide) {
		specsCount++;
		block_(msg, spec, Spec, hide);
	}
	function expect(target) {
		return new Expectation(target);
	}
	function beforeEach(action) {
		current.beforeEach = action;
	}
	function afterEach(action) {
		current.afterEach = action;
	}

	/*
	 * Export
	 */
	global.forceShow = false;
	global.beforeEach = beforeEach;
	global.afterEach = afterEach;
	global.xdescribe = xdescribe;
	global.describe = describe;
	global.xit = xit;
	global.it = it;
	global.expect = expect;
	global.Spy = Spy;
	global.SassmineExpectations = Expectation.prototype;

	window.addEventListener("load", function() {
		document.body.appendChild(container);
	}, true);
})(this);

