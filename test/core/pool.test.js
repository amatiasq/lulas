define(function(require) {
	'use strict';

	var assert = require('chai').assert;
	var sinon = require('sinon');
	var pool = require('core/pool');

	describe.skip('Pool component', function() {

		var object, stub, sut;
		beforeEach(function() {
			object = {};
			stub = sinon.stub().returns(object);
			sut = pool('test', stub);
		});

		it('should invoke creator and return its result when I invoke #get() method', function() {
			sut.get();
			assert(stub.calledOnce, 'creator was not called');
		});

		it('should return a disposed item if available', function() {
			sut.disposeItem(object);
			assert.equal(sut.get(), object, 'returned object is not the disponsed one');
		});

		it('should inject a #dispose() method on objects returned by #get()', function() {
			var item = sut.get();
			assert(item.dispose instanceof Function, 'dispose method was not injected');
		});

		it('should inject a #dispose() method than wraps #disposeItem() method', function() {
			var mock = sinon.mock(sut);
			mock.expects('disposeItem')
				.once()
				.withArgs(object);

			var item = sut.get();
			item.dispose();

			mock.verify();
		});

		it('should pass every argument from #get() to the creator function', function() {
			var arg1 = {};
			var arg2 = [];
			sut.get(arg1, arg2);
			assert(stub.alwaysCalledWithExactly(arg1, arg2), 'arguments wasn\'t passed');
		});

		it('should invoke object\'s own dispose if exists', function() {
			var spy = sinon.spy();
			object.dispose = spy;
			var item = sut.get();
			item.dispose();
			assert(spy.calledOnce, 'overwrited dispose method was not called');
		});
	});
});
