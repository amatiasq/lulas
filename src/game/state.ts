import Game from './index';

export default class GameState {

    private history: EntitiesState[] = [];

    constructor(
        private game: Game,
    ) {}

    tick(cursor: number) {
        if (this.hasStep(cursor)) {
            this.load(cursor);
            return;
        }

        while (!this.hasStep(cursor)) {
            this.processNewStep();
        }
    }

    hasStep(cursor: number) {
        return this.history.length > cursor;
    }

    load(index: number) {
        const state = this.history[index];
        const entities = this.game.getEntities();

        for (const entity of entities) {
            entity.setState(state[entity.id]);
        }
    }

    processNewStep() {
        this.game.tickEntities();

        const entities = this.game.getEntities();
        const newState: EntitiesState = {};

        for (const entity of entities) {
            entity.flushState();
            newState[entity.id] = entity.getState();
        }

        this.history.push(newState);
    }

}

interface EntitiesState {
    [id: number]: object;
}
