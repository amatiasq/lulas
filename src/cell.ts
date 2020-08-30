import {
  Vector,
  vector,
  logVector,
  magnitude,
  subtractVectors,
  radians,
} from './vector';
import { DEFAULT_VISION_FACTOR, DEFAULT_RADIUS } from './CONFIGURATION';
import { bajarColor, Color } from './color';

export type CellId = '[number CellId]';
let lastId = 0;

function getNextId() {
  return (lastId++ as any) as CellId;
}

export interface Cell {
  id: CellId;
  color: Color;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  radius: number;
  vision: number;
}

export function createCell(partial?: Partial<Cell>): Cell {
  return {
    id: getNextId(),
    color: '#ffffff' as Color,
    position: vector(0),
    velocity: vector(0),
    acceleration: vector(0),
    radius: DEFAULT_RADIUS,
    vision:
      (partial && partial.radius ? partial.radius : DEFAULT_RADIUS) *
      DEFAULT_VISION_FACTOR,
    ...partial,
  };
}

export function cellDistance(left: Cell, right: Cell) {
  return magnitude(subtractVectors(left.position, right.position));
}

export function renderCell(context: CanvasRenderingContext2D, cell: Cell) {
  const angleCorrection = Math.PI / 4;

  context.save();

  context.translate(cell.position.x, cell.position.y);
  context.rotate(radians(cell.velocity) + angleCorrection);
  context.beginPath();
  context.arc(0, 0, cell.radius, 0, Math.PI * 1.5);
  context.lineTo(cell.radius, -cell.radius);
  // context.lineTo(cell.radius, 0);
  context.closePath();
  context.lineWidth = 5;
  context.strokeStyle = cell.color;
  context.fillStyle = bajarColor(cell.color, 0.5);
  context.stroke();
  context.fill();

  console.log(bajarColor(cell.color, 0.3));

  context.restore();

  // context.beginPath();
  // context.arc(cell.position.x, cell.position.y, cell.vision, 0, Math.PI * 2);
  // context.strokeStyle = 'red';
  // context.stroke();
}

export function logCell(cell: Cell) {
  return `Cell(${cell.id}) ${cell.radius} { pos: ${logVector(
    cell.position,
  )}, vel: ${logVector(cell.velocity)} }`;
}
