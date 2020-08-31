import { World } from './lulas';
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

const ANGLE_CORRECTION = Math.PI / 4;

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

export function applyForce(cell: Cell, force: Vector) {
  cell.velocity.x += force.x;
  cell.velocity.y += force.y;
}

export function cellDistance(left: Cell, right: Cell) {
  return magnitude(subtractVectors(left.position, right.position));
}

export function renderCell(
  context: CanvasRenderingContext2D,
  { size }: World,
  cell: Cell,
) {
  const renderRadius = cell.radius + 10;
  const { position: pos } = cell;

  renderAt(context, cell);

  if (pos.x - renderRadius < 0) {
    renderAt(context, cell, { x: pos.x + size.x, y: pos.y });
  }
  if (pos.x + renderRadius > size.x) {
    renderAt(context, cell, { x: pos.x - size.x, y: pos.y });
  }

  if (pos.y - renderRadius < 0) {
    renderAt(context, cell, { x: pos.x, y: pos.y + size.y });
  }
  if (pos.y + renderRadius > size.y) {
    renderAt(context, cell, { x: pos.x, y: pos.y - size.y });
  }
}

function renderAt(
  context: CanvasRenderingContext2D,
  cell: Cell,
  pos = cell.position,
) {
  context.save();
  context.translate(pos.x, pos.y);

  context.rotate(radians(cell.velocity) + ANGLE_CORRECTION);
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

  context.restore();
}

export function logCell(cell: Cell) {
  return `Cell(${cell.id}) ${cell.radius} { pos: ${logVector(
    cell.position,
  )}, vel: ${logVector(cell.velocity)} }`;
}
