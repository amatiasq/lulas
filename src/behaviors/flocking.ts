import { MAX_FORCE } from './../CONFIGURATION';
import { applyForce, Cell, cellDistance } from '../cell';
import {
  FLOCKING_ALIGMENENT_FACTOR,
  FLOCKING_COHESION_FACTOR,
  FLOCKING_SEPARATION_FACTOR,
  FLOCKING_SEPARATION_VISION_LIMIT,
} from '../CONFIGURATION';
import { Behavior, World } from '../lulas';
import {
  multiplyVectors,
  subtractVectors,
  sumVectorList,
  sumVectors,
  vector,
  Vector,
  normalize,
} from '../vector';

export const flocking = requireNeighbors(flockingCore);
export const alignementBehavior = requireNeighbors(alignement);
export const cohesionBehavior = requireNeighbors(cohesion);
export const separationBehavior = requireNeighbors(separation);

function flockingCore(cell: Cell, neighbors: Cell[]) {
  return sumVectorList([
    alignement(cell, neighbors),
    cohesion(cell, neighbors),
    separation(cell, neighbors),
  ]);
}

function alignement(cell: Cell, neighbors: Cell[]) {
  const sum = neighbors.map((x) => x.velocity).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / neighbors.length);
  const relative = subtractVectors(average, cell.velocity);
  return multiplyVectors(relative, FLOCKING_ALIGMENENT_FACTOR);
}

function cohesion(cell: Cell, neighbors: Cell[]) {
  const sum = neighbors.map((x) => x.position).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / neighbors.length);
  const relative = subtractVectors(average, cell.position);
  return multiplyVectors(relative, FLOCKING_COHESION_FACTOR);
}

function separation(cell: Cell, neighbors: Cell[]) {
  const limit = cell.vision * FLOCKING_SEPARATION_VISION_LIMIT;
  const closer = neighbors.filter((x) => cellDistance(cell, x) < limit);

  if (!closer.length) {
    return vector(0);
  }

  const sum = closer.map((x) => x.position).reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / closer.length);
  const relative = subtractVectors(average, cell.position);
  return multiplyVectors(relative, FLOCKING_SEPARATION_FACTOR * -1);
}

function requireNeighbors(
  fn: (cell: Cell, neighbors: Cell[]) => Vector,
): Behavior {
  return (cell: Cell, { look }: World) => {
    const neighbors = look(cell.vision);

    if (!neighbors.length) {
      return;
    }

    const force = fn(cell, neighbors);
    applyForce(cell, normalize(force, MAX_FORCE));
  };
}
