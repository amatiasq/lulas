import Cell from '../cell';
import Vector from '../vector';
import GameEntities from './entities';
import GameInteraction from './interaction';
import GameRenderer from './renderer';
import GameTicker, { GameTickerParams } from './ticker';
import GameState from './state';

export default class Game {

    private entities: GameEntities;
    private interaction = new GameInteraction(this);
    private renderer: GameRenderer;
    private state = new GameState(this);
    private ticker = new GameTicker(this.tick.bind(this));

    get world() {
        return this.entities.world;
    }

    constructor(
        private canvas: HTMLCanvasElement,
        mapSize: Vector,
    ) {
        this.entities = new GameEntities(this, mapSize);
        this.renderer = new GameRenderer(this, canvas);
    }

    tick({ turn }: GameTickerParams) {
        this.state.tick(turn);
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

    start() {
        return this.ticker.start();
    }

    stop() {
        return this.ticker.stop();
    }

    pause() {
        return this.ticker.pause();
    }

    toggle() {
        return this.ticker.toggle();
    }

    step() {
        return this.ticker.step();
    }

    //
    // ENTITIES
    //

    getEntities() {
        return this.entities.getEntities();
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
