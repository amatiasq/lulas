define(function(require) {
  'use strict';
  var descriptors = require('core/descriptors');

  function schedule(fn, ms) {
    requestAnimationFrame(fn, ms)
  }


  function Ticker(ticker) {
    this.iteration = 0;
    this.running = false;
    this.ticker = ticker;

    Object.defineProperties(this, descriptors({
      _tick: this._tick.bind(this),
    }));
  }

  Object.defineProperties(Ticker.prototype, descriptors({

    start: function() {
      if (this.running)
        return;

      this.fps = 1000 / 60;
      this.running = true;
      schedule(this._tick, this.fps);
    },

    stop: function() {
      this.running = false;
    },

    toggle: function() {
      if (this.running)
        this.stop();
      else
        this.start();
    },

    _tick: function() {
      if (!this.running)
        return;

      this.iteration++;
      this.ticker(this.iteration);
      schedule(this._tick, this.fps);
    },

  }));

  return Ticker;
});
