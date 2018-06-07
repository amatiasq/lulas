import Stat from '../stat';
import Vector from '../vector';
import World from '../world';
import Cell from './index';

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
        const direction = target.pos.sub(this.cell.pos);
        const push = Vector.withMagnitude(direction, force);

        this.cell.shove(push);
    }
}
