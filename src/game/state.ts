import Game from './index';

export default class GameState {

    private history: EntitiesState[] = [];
    private hasHistory: boolean;
    private lastCalculatedStep = -1;

    constructor(
        private game: Game,
        { hasHistory = false }: GameStateOptions = {},
    ) {
        this.hasHistory = hasHistory;
    }

    tick(cursor: number) {
        if (!this.hasHistory) {
            this.processStep();
            return;
        }

        if (this.hasStep(cursor)) {
            this.load(cursor);
            return;
        }

        while (!this.hasStep(cursor)) {
            this.processHistoryStep(cursor);
        }
    }

    hasStep(cursor: number) {
        return cursor < this.history.length;
    }

    load(index: number) {
        const state = this.history[index];
        const entities = this.game.getEntitiesAlive();

        for (const entity of entities) {
            entity.setState(state[entity.id]);
        }
    }

    processStep() {
        const entities = this.game.tickEntities();

        for (const entity of entities) {
            entity.flushState();
        }
    }

    processHistoryStep(cursor: number) {
        const { history } = this;
        const entities = this.game.tickEntities();
        const newState: EntitiesState = {};

        for (const entity of entities) {
            entity.flushState();
            newState[entity.id] = entity.getState();
        }

        history.push(newState);
    }

}

export interface GameStateOptions {
    hasHistory?: boolean;
}

interface EntitiesState {
    [id: number]: object;
}
