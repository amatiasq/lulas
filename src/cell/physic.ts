import Stat from '../stat';
import Vector from '../vector';
import Cell from './index';

export default class CellPhysic {

    pos = Vector.ZERO;
    velocity = Vector.ZERO;

    constructor(
        private cell: Cell,
    ) {}

    shove(force: Vector) {
        const maxVelocity = this.cell.getStat(Stat.MAX_VELOCITY);
        const maxSize = this.cell.getStat(Stat.MAX_RADIUS);
        const size = this.cell.size;
        const weight = 1 - Math.max(size / maxSize, 0);
        const modification = force.multiply({ x: weight, y: weight });
        let velocity = this.velocity.add(modification);

        if (velocity.magnitude > maxVelocity) {
            velocity = velocity.setMagnitude(maxVelocity);
        }

        this.velocity = velocity;
    }

    friction() {
        const friction = this.cell.getStat(Stat.FRICTION);
        const maxSize = this.cell.getStat(Stat.MAX_RADIUS);
        const { size } = this.cell;
        const frictionFactor = 1 - friction;
        const sizeFactor = size / maxSize;
        const factor = frictionFactor * 0.5 + sizeFactor * 0.5;

        this.velocity = this.velocity.multiply({ x: factor, y: factor });
    }

    move() {
        this.pos = this.pos.add(this.velocity);

        this.friction();
    }

}
