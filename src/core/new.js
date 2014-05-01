define(function(require) {
  'use strict';

  function $new() {
    var instance = Object.create(this);
    instance.init.apply(instance, arguments);
    return instance;
  }

  return $new;
});
