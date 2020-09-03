// Built with https://www.youtube.com/watch?v=mhjuuHl6qHM

import { Cell, cellDistance, applyForce } from '../cell';
import {
  FLOCKING_ALIGMENENT_FACTOR,
  FLOCKING_COHESION_FACTOR,
  FLOCKING_SEPARATION_BORDER_LIMIT,
  FLOCKING_SEPARATION_FACTOR,
  FLOCKING_SEPARATION_VISION_LIMIT,
  MAX_FORCE,
} from '../CONFIGURATION';
import { Behavior, World } from '../lulas';
import {
  multiplyVectors,
  normalize,
  subtractVectors,
  sumVectorList,
  sumVectors,
  Vector,
  vector,
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
  const sum = neighbors.reduce(
    (sum, x) => sumVectors(sum, x.velocity),
    vector(0),
  );

  const average = multiplyVectors(sum, 1 / neighbors.length);
  const desired = normalize(average);
  const steering = subtractVectors(desired, cell.velocity);
  return multiplyVectors(steering, FLOCKING_ALIGMENENT_FACTOR);
}

function cohesion(cell: Cell, neighbors: Cell[]) {
  const sum = neighbors.reduce(
    (sum, x) => sumVectors(sum, x.position),
    vector(0),
  );

  const average = multiplyVectors(sum, 1 / neighbors.length);
  const desired = subtractVectors(average, cell.position);
  const steering = subtractVectors(desired, cell.velocity);
  return multiplyVectors(steering, FLOCKING_COHESION_FACTOR);
}

function separation(cell: Cell, neighbors: Cell[]) {
  const limit = cell.vision * FLOCKING_SEPARATION_VISION_LIMIT;
  let count = 0;

  const sum = neighbors.reduce((sum, x) => {
    const distance = cellDistance(cell, x);
    const borderDistance = distance - cell.radius - x.radius;

    if (distance > limit) {
      return sum;
    }

    count++;
    const diff = subtractVectors(cell.position, x.position);
    const operator = Math.max(borderDistance, FLOCKING_SEPARATION_BORDER_LIMIT);
    const desired = multiplyVectors(diff, 1 / operator);
    return sumVectors(sum, desired);
  }, vector(0));

  if (count === 0) {
    return vector(0);
  }

  const average = multiplyVectors(sum, 1 / count);
  const steerign = subtractVectors(average, cell.velocity);
  return multiplyVectors(steerign, FLOCKING_SEPARATION_FACTOR);
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
