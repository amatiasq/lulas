define(function() {
  'use strict';

  function descriptors(object) {
    return Object.keys(object).reduce(function(descr, key) {
      descr[key] = {
        value: object[key],
        configurable: true,
      };
      return descr;
    }, {});
  }

  return descriptors;
});
