import Game from './index';
import { min, max } from '../math';
import Cell from '../cell';

export default class GameState {

    private history = new Map<number, EntitiesState>();
    private maxHistory: number;
    private initialStep: EntitiesState;

    private get olderStepSaved() {
        return min(...this.history.keys());
    }

    private get newerStepSaved() {
        return max(...this.history.keys());
    }

    constructor(
        private game: Game,
        { maxHistory }: GameStateOptions = {},
    ) {
        this.maxHistory = maxHistory;
    }

    tick(cursor: number) {
        if (this.hasStep(cursor)) {
            this.setState(this.history.get(cursor));
            return;
        }

        if (cursor < this.olderStepSaved) {
            if (cursor !== 0) {
                console.warn('Wiped saved history');
            }

            this.reset();
        }

        while (!this.hasStep(cursor)) {
            this.processStep();
        }
    }

    loadForeignState(state: EntitiesState) {
        this.initialStep = state;
        this.reset();
    }

    getState() {
        return this.history.get(this.newerStepSaved);
    }

    reset() {
        this.setState(this.initialStep);
        this.history.clear();
        this.history.set(0, this.initialStep);
    }

    hasStep(cursor: number) {
        return this.history.has(cursor);
    }

    saveInitialStep() {
        const entities = this.game.tickEntities();
        const state: EntitiesState = {};

        for (const entity of entities) {
            state[entity.id] = entity.getState();
        }

        this.initialStep = state;
        this.reset();
    }

    setState(state: EntitiesState) {
        const entities = this.game.getEntitiesAlive();
        const ids = new Set(Object.keys(state).map(Number));

        for (const entity of entities) {
            const entityState = state[entity.id];
            ids.delete(entity.id);

            if (entityState) {
                entity.setState(state[entity.id]);
            } else if (entity instanceof Cell) {
                entity.die();
            }
        }

        for (const id of ids) {
            const cell = this.game.reviveCell(id);
            cell.setState(state[id]);
        }
    }

    private processStep() {
        const entities = this.game.tickEntities();
        const newState: EntitiesState = {};

        for (const entity of entities) {
            entity.flushState();
            newState[entity.id] = entity.getState();
        }

        this.saveStep(newState);
    }

    private saveStep(newState: EntitiesState) {
        const { history } = this;

        history.set(this.newerStepSaved + 1, newState);

        if (history.size > this.maxHistory) {
            history.delete(this.olderStepSaved);
        }
    }

}

export interface GameStateOptions {
    maxHistory?: number;
}

export interface EntitiesState {
    [id: number]: object;
}
