'use strict';

requirejs.config({
	baseUrl: '/base/src',
	urlArgs: Date.now(),

	paths: {
		'test': '../test',
		'chai': '../bower_components/chai/chai',
		'sinon': '../bower_components//sinon-1.7.3',
		'sinon-chai': '../bower_components/sinon-chai/lib/sinon-chai',
		'chai': ''
	},

	shim: {
		'sinon-chai': [
			'sinon',
			'chai'
		]
	}
});
