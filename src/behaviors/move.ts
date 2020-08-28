import { MAX_SPEED } from './../CONFIGURATION';
import { Cell } from '../cell';
import { sumVectors, limitVector, vector } from '../point';

export function move(cell: Cell) {
  cell.velocity = sumVectors(cell.velocity, cell.acceleration);
  // limitPoint(a, MAX_SPEED);

  cell.acceleration = vector(0);

  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
