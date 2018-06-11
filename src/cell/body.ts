import { pow, sqrt } from '../math';
import Stat from '../stat';
import Cell from './index';

export default class CellBody {

    private _isAlive = true;

    get isAlive() {
        return this._isAlive;
    }

    private _size = 5;

    get size() {
        return this._size;
    }
    set size(value) {
        this._size = value;

        if (value === 0) {
            this.die();
        }
    }

    get energy() {
        return pow(this.size, 2) * Math.PI;
    }
    set energy(value) {
        this.size = sqrt(value / Math.PI);
    }

    constructor(
        private cell: Cell,
    ) {}

    canMitos() {
        const minSize = this.cell.getStat(Stat.MITOSIS_MIN_RADIUS);

        return this.size > minSize;
    }

    mitos() {
        const minSize = this.cell.getStat(Stat.MITOSIS_MIN_RADIUS);
        const childCount = Math.floor(this.size / (minSize / 2));
        const childEnergy = this.energy / childCount;
        const children = [];

        for (let i = 0; i < childCount; i++) {
            const child = new Cell();
            child.energy = childEnergy;
            this.inherit(child);
            children.push(child);
        }

        this.cell.emit('mitos', children);
        this.die();

        return children;
    }

    die() {
        this._isAlive = false;
        this.cell.emit('die', this.cell);
    }

    private inherit(child: Cell) {
        child.setParent(this.cell);
    }

}
