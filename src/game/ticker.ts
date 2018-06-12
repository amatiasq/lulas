export default class GameTicker {

    private _speed = 0;
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
        return this.cursor === 0;
    }

    constructor(
        private callback: GameTickerCallback,
    ) {
        this.onTick = this.onTick.bind(this);
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.speed = 1;
        this.isRunning = true;
        requestAnimationFrame(this.onTick);
    }

    stop() {
        this.isRunning = false;
    }

    pause() {
        this.isPaused = true;
    }

    step() {
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
            this.step();
        }
    }

}

export type GameTickerCallback = () => void;

export interface GameTickerParams {
    turn: number;
}
