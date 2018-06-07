export default class Timer {

    private _isRunning = false;

    get isRunning() {
        return this._isRunning;
    }

    constructor(
        private callback: TimerCallback,
    ) {
        this.onTick = this.onTick.bind(this);
    }

    start() {
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;
        requestAnimationFrame(this.onTick);
    }

    stop() {
        this._isRunning = false;
    }

    toggle() {
        if (this._isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    step() {
        this.callback.call(null);
    }

    private onTick() {
        if (!this._isRunning) {
            return;
        }

        requestAnimationFrame(this.onTick);
        this.callback.call(null);
    }

}

export type TimerCallback = () => void;
