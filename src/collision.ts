import { COLLISION_FRICTION } from './CONFIGURATION';
import { canEat } from './diet';
import { Entity, isAlive, isAnimal } from './entity';
import {
  magnitude,
  multiplyVectors,
  normalize,
  sumVectors,
  Vector,
  vector,
} from './vector';
import { shortestDelta, wrapPosition } from './world';

/**
 * Cells are solid: two of them cannot stand in the same place. Overlaps are
 * pushed apart, each cell giving half the correction, and the pair trades
 * velocities damped by COLLISION_FRICTION so a head-on bump stops both.
 *
 * TWO THINGS ARE DELIBERATELY NOT SOLID:
 *
 * - **A pair where one can eat the other.** Eating needs the two to be touching
 *   (`isTouching` is what turns a hunt into a bite), so a solid predator could
 *   never take a second bite: it would shove its meal away the instant it caught
 *   it. Overlap between an eater and its food is a meal in progress.
 * - **Plants.** They are scenery and food, not bodies. A herbivore has to sit on
 *   one to drain it, and two plants sharing a patch bothers nobody.
 *
 * Everything else collides, including a herbivore against a bigger herbivore and
 * a carnivore against a herbivore it is too small to eat — the pairs that
 * `canEat` rejects. That includes equal sizes, which is the spec's "they meet,
 * touch, and drift apart" made literal.
 */
export function resolveCollisions(entities: Entity[], size: Vector) {
  const bodies = entities.filter((entity) => isAnimal(entity) && isAlive(entity));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const left = bodies[i];
      const right = bodies[j];

      if (canEat(left, right) || canEat(right, left)) continue;

      const delta = shortestDelta(left.position, right.position, size);
      const distance = magnitude(delta);
      const minDistance = left.size + right.size;

      if (distance >= minDistance) continue;

      separate(left, right, delta, distance, minDistance, size);
    }
  }
}

function separate(
  left: Entity,
  right: Entity,
  delta: Vector,
  distance: number,
  minDistance: number,
  size: Vector,
) {
  // Exactly on top of each other: any direction will do, so pick a fixed one
  // rather than a random one — a tick has to be reproducible.
  const direction = distance === 0 ? vector(1, 0) : delta;
  const push = normalize(direction, (minDistance - distance) / 2);

  left.position = wrapPosition(
    sumVectors(left.position, multiplyVectors(push, -1)),
    size,
  );
  right.position = wrapPosition(sumVectors(right.position, push), size);

  // Trade velocities, damped: two cells meeting head-on stop instead of
  // grinding through each other. Ported from `flocking/src/behaviors/solidBody`.
  const factor = 1 - COLLISION_FRICTION;
  const leftVelocity = left.velocity;

  left.velocity = multiplyVectors(right.velocity, factor);
  right.velocity = multiplyVectors(leftVelocity, factor);
}
