import Vector from '../vector';
import GameEntities from './entities';
import GameInteraction from './interaction';
import GameRenderer from './renderer';
import GameTicker from './ticker';
import Cell from '../cell';

export default class Game {

    private entities: GameEntities;
    private interaction = new GameInteraction(this);
    private renderer: GameRenderer;
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

    tick() {
        this.entities.tick();
        this.render();
        this.interaction.interact();
    }

    //
    // TICKER
    //

    start() {
        return this.ticker.start();
    }

    stop() {
        return this.ticker.stop();
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

    //
    // INTERACTION
    //

    addListeners() {
        this.interaction.addListeners(this.canvas);
    }

    //
    // RENDER
    //

    // drawLine(from: Vector, to: Vector, options?: object) {
    //     return this.renderer.drawLine(from, to, options);
    // }

    // drawCircle(at: Vector, radius: number, options?: object) {
    //     return this.renderer.drawCircle(at, radius, options);
    // }

    render() {
        return this.renderer.renderEntities();
    }

    renderCellDetails(cell: Cell) {
        return this.renderer.renderCellDetails(cell);
    }

}
