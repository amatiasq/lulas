export default class GameTicker {

    private _speed = 1;
    private cursor = -1;
    private isRunning = false;
    isPaused = false;

    get speed() {
        return this._speed;
    }
    set speed(value) {
        if (value !== 1 && value !== -1) {
            throw new Error(`Invalid speed ${value}`);
        }

        this._speed = value;
    }

    get isForward() {
        return this.speed === 1;
    }

    get isBackwards() {
        return this.speed === -1;
    }

    get isAtBegining() {
        return this.cursor <= 0;
    }

    constructor(
        private callback: GameTickerCallback,
    ) {
        this.onTick = this.onTick.bind(this);
    }

    //
    // Timer execution
    //

    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        requestAnimationFrame(this.onTick);
    }

    stop() {
        this.isRunning = false;
    }

    //
    // Flow control
    //

    play() {
        this.speed = 1;
        this.isPaused = false;
        this.start();
    }

    playback() {
        this.speed = -1;
        this.isPaused = false;
        this.start();
    }

    step() {
        this.speed = 1;
        this.isPaused = true;
        this.execute();
    }

    stepback() {
        this.speed = -1;
        this.isPaused = true;
        this.execute();
    }

    pause() {
        this.isPaused = true;
    }

    //
    // Implementation details
    //

    private execute() {
        if (this.isBackwards && this.isAtBegining) {
            console.warn(`Can't go further in history!`);
            this.isPaused = true;
            return;
        }

        this.cursor += this.speed;
        this.callback.call(null, {
            turn: this.cursor,
        });
    }

    private onTick() {
        if (!this.isRunning) {
            return;
        }

        requestAnimationFrame(this.onTick);

        if (!this.isPaused) {
            this.execute();
        }
    }

}

export type GameTickerCallback = () => void;

export interface GameTickerParams {
    turn: number;
}
