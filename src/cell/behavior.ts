import Stat from "../stat.js";
import Vector from "../vector.js";
import World from "../world.js";
import Cell from "./index.js";

export default class CellBehavior {

    constructor(
        private cell: Cell,
    ) {}

    tick(map: World) {
        const entities = this.cell.getVisibleEntities(map);

        for (const entity of entities) {
            if (entity instanceof Cell) {
                this.interactWithCell(entity);
            }
        }

        this.cell.move();
    }

    interactWithCell(other: Cell) {
        const isTouching = this.cell.isTouching(other);

        if (this.cell.canEat(other)) {
            if (isTouching) {
                this.cell.eat(other);
            } else {
                this.hunt(other);
            }
        }
    }

    hunt(target: Cell) {
        const force = this.cell.getStat(Stat.HUNT_ACCELERATION);
        const direction = this.cell.pos.diff(target.pos);
        const push = Vector.withMagnitude(direction, force);

        this.cell.shove(push);
    }
}
