import Stat from "../stat.js";
import Vector from "../vector.js";
import Cell from "./index.js";

export default class CellPhysic {

    pos = Vector.ZERO;
    velocity = Vector.ZERO;

    constructor(
        private cell: Cell,
    ) {}

    shove(force: Vector) {
        const maxSize = this.cell.getStat(Stat.MAX_RADIUS);
        const size = this.cell.size;
        const weight = 1 - Math.max(size / maxSize, 0);
        const modification = force.multiply({ x: weight, y: weight });

        // console.log(modification);

        this.velocity = this.velocity.add(modification);
    }

    move() {
        this.pos = this.pos.add(this.velocity);
    }

}
