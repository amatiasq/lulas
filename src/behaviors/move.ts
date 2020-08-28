import { MAX_SPEED } from './../CONFIGURATION';
import { Cell } from '../cell';
import { sumPoints, limitPoint, point } from '../point';

export function move(cell: Cell) {
  cell.velocity = sumPoints(cell.velocity, cell.acceleration);
  // limitPoint(a, MAX_SPEED);

  cell.acceleration = point(0);

  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
