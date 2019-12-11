import { Stat } from '../Stat';
import { Vector } from '../Vector';
import { Cell } from './Cell';
import { CellState } from './CellState';

export class CellPhysic {
  private readonly shoves: Vector[] = [];

  constructor(private readonly cell: Cell, private readonly state: CellState) {
    state.pos = Vector.ZERO;
    state.velocity = Vector.ZERO;
  }

  get pos() {
    return this.state.pos;
  }
  set pos(value: Vector) {
    this.state.pos = value;
  }

  get velocity() {
    return this.state.velocity;
  }
  set velocity(value: Vector) {
    this.state.velocity = value;
  }

  shove(force: Vector) {
    const maxSize = this.cell.getStat(Stat.MAX_RADIUS);
    const size = this.cell.size;
    const weight = 1 - Math.max(size / maxSize, 0);
    const modification = force.multiply({ x: weight, y: weight });

    this.shoves.push(modification);
  }

  friction(velocity = this.velocity) {
    const friction = this.cell.getStat(Stat.FRICTION);
    const maxSize = this.cell.getStat(Stat.MAX_RADIUS);
    const { size } = this.cell;
    const frictionFactor = 1 - friction;
    const sizeFactor = size / maxSize;
    const factor = frictionFactor * 0.5 + sizeFactor * 0.5;

    this.velocity = velocity.multiply({ x: factor, y: factor });
  }

  move() {
    const maxVelocity = this.cell.getStat(Stat.MAX_VELOCITY);
    let velocity = this.velocity;

    for (const shove of this.shoves) {
      velocity = velocity.add(shove);
    }

    if (velocity.magnitude > maxVelocity) {
      velocity = velocity.setMagnitude(maxVelocity);
    }

    this.shoves.length = 0;
    this.pos = this.pos.add(velocity);

    this.friction(velocity);
  }
}
