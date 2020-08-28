import { World, Behavior } from './../lulas';
import { Cell, cellDistance } from '../cell';
import { sumVectors, vector, multiplyVectors, subtractVectors } from '../point';
import {
  FLOCKING_ALIGMENENT_FACTOR,
  FLOCKING_COHESION_FACTOR,
  FLOCKING_SEPARATION_FACTOR,
  FLOCKING_SEPARATION_VISION_LIMIT,
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

  const sum = neighbors.map((x) => x.velocity).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / neighbors.length);
  const relative = subtractVectors(average, cell.velocity);
  const align = multiplyVectors(relative, FLOCKING_ALIGMENENT_FACTOR);

  cell.velocity.x += align.x;
  cell.velocity.y += align.y;
}

function cohesion(cell: Cell, neighbors: Cell[]) {
  if (!neighbors.length) {
    return;
  }

  const sum = neighbors.map((x) => x.position).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / neighbors.length);
  const relative = subtractVectors(average, cell.position);
  const cohece = multiplyVectors(relative, FLOCKING_COHESION_FACTOR);

  cell.velocity.x += cohece.x;
  cell.velocity.y += cohece.y;
}

function separation(cell: Cell, neighbors: Cell[]) {
  const limit = cell.vision * FLOCKING_SEPARATION_VISION_LIMIT;
  neighbors = neighbors.filter((x) => cellDistance(cell, x) < limit);

  if (!neighbors.length) {
    return;
  }

  const sum = neighbors.map((x) => x.position).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / neighbors.length);
  const relative = subtractVectors(average, cell.position);
  const separation = multiplyVectors(relative, FLOCKING_SEPARATION_FACTOR);

  cell.velocity.x -= separation.x;
  cell.velocity.y -= separation.y;
}

function requireNeighbors(
  fn: (cell: Cell, neighbors: Cell[]) => void,
): Behavior {
  return (cell: Cell, { look }: World) => fn(cell, look(cell.vision));
}
