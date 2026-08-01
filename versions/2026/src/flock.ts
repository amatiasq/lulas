import {
  FLOCKING_ALIGNMENT_FACTOR,
  FLOCKING_COHESION_FACTOR,
  FLOCKING_FORCE,
  FLOCKING_SEPARATION_FACTOR,
  FLOCKING_SEPARATION_RANGE,
} from './CONFIGURATION';
import { Entity, visionOf } from './entity';
import {
  limitVector,
  magnitude,
  multiplyVectors,
  subtractVectors,
  sumVectors,
  Vector,
  vector,
} from './vector';
import { shortestDelta } from './world';

/**
 * Boids, borrowed from the sibling `flocking/` project: alignment, cohesion and
 * separation, summed and capped at FLOCKING_FORCE.
 *
 * Two rules keep it from breaking the ecosystem:
 *
 * 1. **Same species only.** A herbivore that aligns with a carnivore steers
 *    itself into its own predator; a herd is herbivores, a pack is carnivores.
 * 2. **Idle only.** `decide` reaches this after the threat scan and the prey
 *    scan have both come up empty, so flocking never gets summed with fleeing or
 *    hunting. Invariant 3 is about exactly that: a blended force leaves a
 *    herbivore drifting into the predator. This is what a cell does with the
 *    time it has left over, nothing more.
 *
 * Every position here goes through `shortestDelta`, so the averages are relative
 * to the cell and the wrap is handled: neighbours across an edge pull the cell
 * across it, not back through the middle of the map.
 */
export function flock(cell: Entity, visible: Entity[], worldSize: Vector): Vector {
  const neighbors = visible.filter((other) => other.type === cell.type);

  if (!neighbors.length) return vector(0);

  const deltas = neighbors.map((other) =>
    shortestDelta(cell.position, other.position, worldSize),
  );

  // Carnivores get separation and nothing else: they spread out to cover the
  // map instead of travelling as a pack. This is not decoration — a pack hunts
  // the same herd, splits the same meal and burns the same area doing it, and
  // with cohesion on, carnivores went extinct in half the long runs.
  if (cell.type === 'carnivore') {
    return limitVector(separation(cell, deltas), FLOCKING_FORCE);
  }

  return limitVector(
    sumVectors(
      sumVectors(alignment(cell, neighbors), cohesion(deltas)),
      separation(cell, deltas),
    ),
    FLOCKING_FORCE,
  );
}

/** Match the neighbours' heading. */
function alignment(cell: Entity, neighbors: Entity[]) {
  const sum = neighbors
    .map((other) => other.velocity)
    .reduce(sumVectors, vector(0));

  const average = multiplyVectors(sum, 1 / neighbors.length);
  return multiplyVectors(
    subtractVectors(average, cell.velocity),
    FLOCKING_ALIGNMENT_FACTOR,
  );
}

/** Head for the middle of the group. */
function cohesion(deltas: Vector[]) {
  const sum = deltas.reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / deltas.length);
  return multiplyVectors(average, FLOCKING_COHESION_FACTOR);
}

/**
 * Keep out of the ones that got too close. This is the soft version of
 * `collision.ts`: it steers a cell away before contact, where the collision code
 * only untangles cells that already overlap.
 */
function separation(cell: Entity, deltas: Vector[]) {
  const limit = visionOf(cell) * FLOCKING_SEPARATION_RANGE;
  const close = deltas.filter((delta) => magnitude(delta) < limit);

  if (!close.length) return vector(0);

  const sum = close.reduce(sumVectors, vector(0));
  const average = multiplyVectors(sum, 1 / close.length);

  // Away from them, hence the negative factor.
  return multiplyVectors(average, -FLOCKING_SEPARATION_FACTOR);
}
