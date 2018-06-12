import Cell from '../cell';
import Vector from '../vector';
import Game from './index';

export default class GameInteraction {

    mouse: Vector = null;
    private isListening = false;

    constructor(
        private game: Game,
    ) {
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    addListeners(canvas: HTMLCanvasElement) {
        if (this.isListening) {
            return false;
        }

        document.addEventListener('keypress', this.onKeyPress);
        canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private onKeyPress(event: KeyboardEvent) {
        switch (event.code) {
            case 'Space':
                this.game.toggle();

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

            default:
                console.log(`KEYPRESS ${event.code}`);
        }
    }

    private onMouseMove(event: MouseEvent) {
        this.mouse = Vector.from(event);
        this.game.render();
        this.interact();
    }

    interact() {
        const { game } = this;
        const { world } = game;

        if (!this.mouse) {
            return;
        }

        const hover = world.getEntitiesAt(this.mouse);

        if (!hover.length) {
            return;
        }

        for (const cell of hover as Cell[]) {
            game.renderCellDetails(cell);
        }
    }

}
