import { World, Behavior } from './../lulas';
import { Cell, cellDistance } from '../cell';
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
  FLOCKING_SEPARATION_FACTOR,
  FLOCKING_SEPARATION_LIMIT,
} from '../CONFIGURATION';

export const flocking = requireNeighbors(flockingCore);
export const alignementBehavior = requireNeighbors(alignement);
export const cohesionBehavior = requireNeighbors(cohesion);
export const separationBehavior = requireNeighbors(separation);

function flockingCore(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  alignement(cell, neighbors);
  cohesion(cell, neighbors);
  separation(cell, neighbors);
}

function alignement(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  const sum = neighbors.map((x) => x.velocity).reduce(sumPoints, point(0));
  const average = multiplyPoint(sum, 1 / neighbors.length);
  const relative = subtractPoints(average, cell.velocity);
  const align = multiplyPoint(relative, FLOCKING_ALIGMENENT_FACTOR);

  cell.velocity.x += align.x;
  cell.velocity.y += align.y;
}

function cohesion(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  const sum = neighbors.map((x) => x.position).reduce(sumPoints, point(0));
  const average = multiplyPoint(sum, 1 / neighbors.length);
  const relative = subtractPoints(average, cell.position);
  const cohece = multiplyPoint(relative, FLOCKING_COHESION_FACTOR);

  cell.velocity.x += cohece.x;
  cell.velocity.y += cohece.y;
}

function separation(cell: Cell, neighbors: Cell[]) {
  const limit = cell.vision * FLOCKING_SEPARATION_LIMIT;
  neighbors = neighbors.filter((x) => cellDistance(cell, x) < limit);

  if (!neighbors.length) {
    return;
  }

  const sum = neighbors.map((x) => x.position).reduce(sumPoints, point(0));
  const average = multiplyPoint(sum, 1 / neighbors.length);
  const relative = subtractPoints(average, cell.position);
  const separation = multiplyPoint(relative, FLOCKING_SEPARATION_FACTOR);

  cell.velocity.x -= separation.x;
  cell.velocity.y -= separation.y;
}

function requireNeighbors(
  fn: (cell: Cell, neighbors: Cell[]) => void,
): Behavior {
  return (cell: Cell, { look }: World) => fn(cell, look(cell.vision));
}
