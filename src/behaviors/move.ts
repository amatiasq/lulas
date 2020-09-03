import { MAX_SPEED } from './../CONFIGURATION';
import { Cell } from '../cell';
import { MAX_FORCE } from '../CONFIGURATION';
import { limitVector, sumVectors, vector, isZero } from '../vector';

export function move(cell: Cell) {
  if (!isZero(cell.acceleration)) {
    const acc = limitVector(cell.acceleration, MAX_FORCE);
    const vel = sumVectors(cell.velocity, acc);

    cell.velocity = limitVector(vel, MAX_SPEED);
    cell.acceleration = vector(0);
  }

  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
