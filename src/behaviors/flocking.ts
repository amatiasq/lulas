import { World, Behavior } from './../lulas';
import { Cell } from '../cell';
import {
  sumPoints,
  Point,
  point,
  multiplyPoint,
  subtractPoints,
} from '../point';
import {
  FLOCKING_ALIGMENENT_FACTOR,
  FLOCKING_COHESION_FACTOR,
} from '../CONFIGURATION';

export const flocking = requireNeighbors(flockingCore);
export const alignementBehaviour = requireNeighbors(alignement);
export const cohesionBehaviour = requireNeighbors(cohesion);

function flockingCore(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  alignement(cell, neighbors);
}

function alignement(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return point(0, 0);
  }

  const sum = neighbors.map((x) => x.velocity).reduce(sumPoints, point(0, 0));
  const average = multiplyPoint(sum, 1 / neighbors.length);
  const relative = subtractPoints(average, cell.velocity);
  const align = multiplyPoint(relative, FLOCKING_ALIGMENENT_FACTOR);

  cell.velocity.x += align.x;
  cell.velocity.y += align.y;
}

function cohesion(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return point(0, 0);
  }

  const sum = neighbors.map((x) => x.position).reduce(sumPoints, point(0, 0));
  const average = multiplyPoint(sum, 1 / neighbors.length);
  const relative = subtractPoints(average, cell.position);
  const cohece = multiplyPoint(relative, FLOCKING_COHESION_FACTOR);

  cell.velocity.x += cohece.x;
  cell.velocity.y += cohece.y;
}

function requireNeighbors(
  fn: (cell: Cell, neighbors: Cell[]) => void,
): Behavior {
  return (cell: Cell, { look }: World) => fn(cell, look(cell.radius * 10));
}
