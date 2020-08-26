import { Point } from './Point';

export interface Cell {
  position: Point;
  velocity: Point;
}

export function createCell(partial?: Partial<Cell>): Cell {
  return {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    ...partial,
  };
}

export function stepCell(cell: Cell) {
  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}
