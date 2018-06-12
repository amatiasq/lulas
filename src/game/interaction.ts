import Cell from '../cell';
import Vector from '../vector';
import Game from './index';

export default class GameInteraction {

    mouse: Vector = null;
    private isListening = false;
    private inspector = new Set<Cell>();
    private isHistoryEnabled: boolean;

    constructor(
        private game: Game,
        { isHistoryEnabled }: GameInteractionOptions = {},
    ) {
        this.onClick = this.onClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onKeyPress = isHistoryEnabled
            ? this.onKeyPressHistory.bind(this)
            : this.onKeyPress.bind(this);
    }

    interact() {
        const { game } = this;
        const { world } = game;

        if (!this.mouse) {
            return;
        }

        const hover = world.getEntitiesAt(this.mouse);
        const inspect = new Set([ ...this.inspector, ...hover as Cell[] ]);

        for (const cell of inspect) {
            game.renderCellDetails(cell);
        }
    }

    addListeners(canvas: HTMLCanvasElement) {
        if (this.isListening) {
            return false;
        }

        document.addEventListener('keypress', this.onKeyPress);
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('click', this.onClick);
    }

    private onClick(event: MouseEvent) {
        this.mouse = Vector.from(event);

        const { game, inspector } = this;
        const { world } = game;
        const hover = world.getEntitiesAt(this.mouse);

        for (const cell of hover as Cell[]) {
            if (inspector.has(cell)) {
                inspector.delete(cell);
            } else {
                inspector.add(cell);
            }
        }

        this.game.updateView();
    }

    private onKeyPress(event: KeyboardEvent) {
        switch (event.code) {
            case 'Space':
                this.game.isPaused = !this.game.isPaused;
        }
    }

    private onKeyPressHistory(event: KeyboardEvent) {
        switch (event.code) {
            case 'Space':
                this.game.isPaused = !this.game.isPaused;
                break;

            case 'KeyA':
            case 'KeyJ':
                this.game.speed = -1;
                this.game.isPaused = false;
                break;

            case 'KeyS':
            case 'KeyK':
                this.game.speed = -1;
                this.game.isPaused = true;
                this.game.step();
                break;

            case 'KeyD':
            case 'KeyL':
                this.game.speed = 1;
                this.game.isPaused = true;
                this.game.step();
                break;

            case 'KeyF':
            case 'Semicolon':
                this.game.speed = 1;
                this.game.isPaused = false;
                break;

            // default:
            //     console.log(`KEYPRESS ${event.code}`);
        }
    }

    private onMouseMove(event: MouseEvent) {
        this.mouse = Vector.from(event);
        this.game.updateView();
    }

}

export interface GameInteractionOptions {
    isHistoryEnabled?: boolean;
}
