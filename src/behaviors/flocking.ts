import { World, Behavior } from './../lulas';
import { Cell } from '../cell';
import {
  sumPoints,
  Point,
  point,
  multiplyPoint,
  subtractPoints,
} from '../point';
import { FLOCKING_ALIGMENENT_FACTOR } from '../CONFIGURATION';

export const flocking = requireNeighbors(flockingCore);
export const alignementBehaviour: Behavior = requireNeighbors(alignement);

function requireNeighbors(fn: (cell: Cell, neighbors: Cell[]) => void) {
  return (cell: Cell, { look }: World) => fn(cell, look(cell.radius * 10));
}

export function flockingCore(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  alignement(cell, neighbors);
}

function alignement(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return point(0, 0);
  }

  const sum = neighbors.reduce(
    (direction: Point, neighbor: Cell) =>
      sumPoints(direction, subtractPoints(neighbor.velocity, cell.velocity)),
    point(0, 0),
  );

  const average = multiplyPoint(sum, 1 / neighbors.length);
  const align = multiplyPoint(average, FLOCKING_ALIGMENENT_FACTOR);

  cell.velocity.x += align.x;
  cell.velocity.y += align.y;
}
