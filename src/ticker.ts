
export default class Ticker {
  private tick: (time: number) => void;
  running = false;
  iteration = 0;


  constructor(readonly ticker: (iteration: number) => void) {
    this.tick = () => this._tick();
  }


  start() {
    if (this.running)
      return;

    this.running = true;
    requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
  }

  toggle() {
    if (this.running)
      this.stop();
    else
      this.start();
  }

  private _tick() {
    if (!this.running)
      return;

    this.iteration++;
    this.ticker(this.iteration);
    requestAnimationFrame(this.tick);
  }
}
