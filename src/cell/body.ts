import { pow, sqrt } from "../math.js";
import Stat from "../stat.js";
import Cell from "./index.js";

export default class CellBody {

    size = 5;

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
            this.inherit(child);
            children.push(child);
        }

        this.cell.emit("mitos", children);

        return children;
    }

    die() {
        this.cell.emit("die", this);
    }

    private inherit(child: Cell) {
        child.setParent(this.cell);
    }

}
