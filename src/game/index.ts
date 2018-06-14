import Cell from '../cell';
import Vector from '../vector';
import GameEntities from './entities';
import GameInteraction from './interaction';
import GameRenderer from './renderer';
import GameState, { EntitiesState } from './state';
import GameTicker, { GameTickerParams } from './ticker';
import { IWorldEntity, EntityState } from '../world';

export default class Game {

    private entities: GameEntities;
    private interaction: GameInteraction;
    private renderer: GameRenderer;
    private state: GameState;
    private ticker: GameTicker;
    private onTick: (params: GameOnTickParams) => void;

    get world() {
        return this.entities.world;
    }

    constructor(
        private canvas: HTMLCanvasElement,
        mapSize: Vector,
        {
            maxHistory = 100,
            onTick,
        }: GameOptions = {},
    ) {
        this.onTick = onTick;
        this.entities = new GameEntities(this, mapSize);
        this.renderer = new GameRenderer(this, canvas);
        this.state = new GameState(this, { maxHistory });
        this.ticker = new GameTicker(this.tick.bind(this));
        this.interaction = new GameInteraction(this, {
            isHistoryEnabled: Boolean(maxHistory),
        });
    }

    init() {
        this.addListeners();
        this.state.saveInitialStep();
        this.start();
        this.pause();
        this.render();
    }

    tick({ turn: tick }: GameTickerParams) {
        const entities = this.getEntitiesAlive();

        this.state.tick(tick);
        this.updateView();

        this.onTick({ tick, entities });
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

    play() {
        return this.ticker.play();
    }

    playback() {
        return this.ticker.playback();
    }

    pause() {
        return this.ticker.pause();
    }

    step() {
        return this.ticker.step();
    }

    stepback() {
        return this.ticker.stepback();
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
    // STATE
    //

    getState() {
        return this.state.getState();
    }

    setState(value: EntitiesState) {
        return this.state.loadForeignState(value);
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
    maxHistory?: number;
    onTick?(params: GameOnTickParams): void;
}

export interface GameOnTickParams {
    tick: number;
    entities: IWorldEntity<EntityState>[];
}