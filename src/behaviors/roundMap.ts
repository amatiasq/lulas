import { Cell } from '../cell';
import { World } from '../lulas';

export function roundMap(cell: Cell, { size }: World) {
  if (cell.position.x < 0) {
    cell.position.x += size.x;
  }

  if (cell.position.y < 0) {
    cell.position.y += size.y;
  }

  if (cell.position.x > size.x) {
    cell.position.x -= size.x;
  }

  if (cell.position.y > size.y) {
    cell.position.y -= size.y;
  }
}
