import { MAX_SPEED, MAX_FORCE } from './../CONFIGURATION';
import { Cell } from '../cell';
import { sumVectors, limitVector, vector } from '../vector';

export function move(cell: Cell) {
  cell.velocity = sumVectors(
    cell.velocity,
    limitVector(cell.acceleration, MAX_FORCE),
  );

  // limitVector(a, MAX_SPEED);

  cell.acceleration = vector(0);

  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
