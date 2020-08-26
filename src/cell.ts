import { Point } from './Point';

export interface Cell {
  color: string;
  position: Point;
  velocity: Point;
  radius: number;
}

export function createCell(partial?: Partial<Cell>): Cell {
  return {
    color: 'white',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 5,
    ...partial,
  };
}

export function stepCell(mapSize: Point, cell: Cell) {
  move(cell);
  roundMap(mapSize, cell);
  return cell;
}

function move(cell: Cell) {
  cell.position.x += cell.velocity.x;
  cell.position.y += cell.velocity.y;
}

function roundMap(mapSize: Point, cell: Cell) {
  if (cell.position.x - cell.radius < 0) {
    cell.position.x = cell.radius;
  }
  if (cell.position.y - cell.radius < 0) {
    cell.position.y = cell.radius;
  }

  if (cell.position.x + cell.radius > mapSize.x) {
    cell.position.x = mapSize.x - cell.radius;
  }

  if (cell.position.y + cell.radius > mapSize.y) {
    cell.position.y = mapSize.y - cell.radius;
  }
}

export function renderCell(context: CanvasRenderingContext2D, cell: Cell) {
  context.beginPath();
  context.arc(cell.position.x, cell.position.y, cell.radius, 0, Math.PI * 2);
  context.closePath();
  context.strokeStyle = cell.color;
  context.stroke();
}
