import Stat from '../stat';
import Vector from '../vector';
import Cell from './index';
import { buffer, bufferProp, staticProp } from './state-decorators';

@buffer
export default class CellState {

    private stats = new Map<Stat, number>();

    @staticProp
    parent: number;

    @staticProp
    color: string;

    @bufferProp
    isAlive: boolean;

    @bufferProp
    size: number;

    @bufferProp
    pos: Vector;

    @bufferProp
    velocity: Vector;

    constructor(
        private cell: Cell,
    ) {}

    getStat(key: Stat) {
        return this.stats.get(key);
    }

    setStat(key: Stat, value: number) {
        this.stats.set(key, value);
    }

    //
    // Methods injected by decorator
    //

    getState(): IStateScreenshot {
        return null;
    }

    setState(newState: IStateScreenshot) {}

    flushState() {}

}

export interface IStateScreenshot {
    isAlive: boolean;
    size: number;
    pos: Vector;
    velocity: Vector;
}
