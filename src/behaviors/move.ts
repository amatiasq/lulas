import { Cell } from '../cell';

export function move(cell: Cell) {
  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
