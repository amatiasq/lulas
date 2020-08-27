import { World } from './../lulas';
import { Cell } from '../cell';

export function roundMap(cell: Cell, { size }: World) {
  if (cell.position.x - cell.radius < 0) {
    cell.position.x = cell.radius;
    cell.velocity.x = Math.abs(cell.velocity.x);
  }
  if (cell.position.y - cell.radius < 0) {
    cell.position.y = cell.radius;
    cell.velocity.y = Math.abs(cell.velocity.y);
  }

  if (cell.position.x + cell.radius > size.x) {
    cell.position.x = size.x - cell.radius;
    cell.velocity.x = -Math.abs(cell.velocity.x);
  }

  if (cell.position.y + cell.radius > size.y) {
    cell.position.y = size.y - cell.radius;
    cell.velocity.y = -Math.abs(cell.velocity.y);
  }
}
