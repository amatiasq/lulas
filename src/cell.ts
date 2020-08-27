import {
  Point,
  point,
  logPoint,
  pointMagnitude,
  subtractPoints,
} from './point';

export type CellId = '[number CellId]';
let lastId = 0;

function getNextId() {
  return (lastId++ as any) as CellId;
}

export interface Cell {
  id: CellId;
  color: string;
  position: Point;
  velocity: Point;
  radius: number;
  vision: number;
}

export function createCell(partial?: Partial<Cell>): Cell {
  const defaultRadius = 5;

  return {
    id: getNextId(),
    color: 'white',
    position: point(0, 0),
    velocity: point(0, 0),
    radius: defaultRadius,
    vision: (partial && partial.radius ? partial.radius : defaultRadius) * 10,
    ...partial,
  };
}

export function cellDistance(left: Cell, right: Cell) {
  return pointMagnitude(subtractPoints(left.position, right.position));
}

export function renderCell(context: CanvasRenderingContext2D, cell: Cell) {
  context.beginPath();
  context.arc(cell.position.x, cell.position.y, cell.radius, 0, Math.PI * 2);
  context.strokeStyle = cell.color;
  context.stroke();

  // context.beginPath();
  // context.arc(cell.position.x, cell.position.y, cell.vision, 0, Math.PI * 2);
  // context.strokeStyle = 'red';
  // context.stroke();
}

export function logCell(cell: Cell) {
  return `Cell(${cell.id}) ${cell.radius} { pos: ${logPoint(
    cell.position,
  )}, vel: ${logPoint(cell.velocity)} }`;
}
