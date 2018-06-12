import Cell from '../cell';
import Vector from '../vector';
import GameEntities from './entities';
import GameInteraction from './interaction';
import GameRenderer from './renderer';
import GameState from './state';
import GameTicker, { GameTickerParams } from './ticker';

export default class Game {

    private entities: GameEntities;
    private interaction: GameInteraction;
    private renderer: GameRenderer;
    private state: GameState;
    private ticker: GameTicker;

    get world() {
        return this.entities.world;
    }

    constructor(
        private canvas: HTMLCanvasElement,
        mapSize: Vector,
        { hasHistory }: GameOptions = {},
    ) {
        this.entities = new GameEntities(this, mapSize);
        this.renderer = new GameRenderer(this, canvas);
        this.state = new GameState(this, { hasHistory });
        this.ticker = new GameTicker(this.tick.bind(this));
        this.interaction = new GameInteraction(this, {
            isHistoryEnabled: Boolean(hasHistory),
        });
    }

    tick({ turn }: GameTickerParams) {
        const entities = this.getEntitiesAlive();
        console.log(turn, entities.length);

        this.state.tick(turn);
        this.updateView();
    }

    updateView() {
        this.render();
        this.interaction.interact();
    }

    //
    // TICKER
    //

    get isPaused() {
        return this.ticker.isPaused;
    }
    set isPaused(value: boolean) {
        this.ticker.isPaused = value;
    }

    get speed() {
        return this.ticker.speed;
    }
    set speed(value: number) {
        this.ticker.speed = value;
    }

    goTo(step: number) {
        return this.state.tick(step);
    }

    start() {
        return this.ticker.start();
    }

    stop() {
        return this.ticker.stop();
    }

    pause() {
        return this.ticker.pause();
    }

    step() {
        return this.ticker.step();
    }

    //
    // ENTITIES
    //

    getEntitiesAlive() {
        return this.entities.getEntitiesAlive();
    }

    addCell(position: Vector) {
        return this.entities.addCell(position);
    }

    tickEntities() {
        return this.entities.tickEntities();
    }

    //
    // INTERACTION
    //

    addListeners() {
        this.interaction.addListeners(this.canvas);
    }

    //
    // RENDER
    //

    render() {
        return this.renderer.renderEntities();
    }

    renderCellDetails(cell: Cell) {
        return this.renderer.renderCellDetails(cell);
    }

}

export interface GameOptions {
    hasHistory?: boolean;
}