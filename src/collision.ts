import { COLLISION_FRICTION } from './CONFIGURATION';
import { canEat } from './diet';
import { Entity, isAlive, isAnimal } from './entity';
import { indexEntities } from './spatial';
import {
  dotProduct,
  magnitude,
  multiplyVectors,
  normalize,
  subtractVectors,
  sumVectors,
  Vector,
  vector,
} from './vector';
import { shortestDelta, wrapPosition } from './world';

/**
 * Cells are solid: overlaps are pushed apart, each cell giving half the
 * correction, and the pair trades velocities damped by COLLISION_FRICTION.
 *
 * TWO THINGS ARE DELIBERATELY NOT SOLID:
 *
 * - **A pair where one can eat the other.** Eating is gated on `isTouching`, so
 *   a solid predator would shove its meal away and never take a second bite.
 * - **Plants.** Scenery and food, not bodies: a herbivore has to sit on one.
 *
 * So the pairs that collide are exactly the ones `canEat` rejects in both
 * directions, equal sizes included.
 */
export function resolveCollisions(entities: Entity[], worldSize: Vector) {
  const bodies = entities.filter((entity) => isAnimal(entity) && isAlive(entity));
  if (bodies.length < 2) return;

  const index = indexEntities(bodies, worldSize);
  const position = new Map(bodies.map((body, i) => [body.id, i]));
  const reach = broadPhaseReach(bodies);

  for (let i = 0; i < bodies.length; i++) {
    const left = bodies[i];

    // Each pair once, in array order: `separate` moves both bodies, so a
    // different order is a different simulation.
    const candidates = index
      .candidatesNear(left.position, left.size + reach)
      .filter((other) => position.get(other.id)! > i)
      .sort((a, b) => position.get(a.id)! - position.get(b.id)!);

    for (const right of candidates) {
      if (canEat(left, right) || canEat(right, left)) continue;

      const delta = shortestDelta(left.position, right.position, worldSize);
      const distance = magnitude(delta);
      const minDistance = left.size + right.size;

      if (distance >= minDistance) continue;

      separate(left, right, delta, distance, minDistance, worldSize);
    }
  }
}

/**
 * How far past its own radius a body has to ask for candidates.
 *
 * The index is built once, before anything moves, but `separate` moves bodies
 * while the pass runs, so a pair out of reach when the tree was built can be
 * shoved into contact before it is looked at. One `maxSize` covers the other
 * body's radius; the other two cover that drift.
 *
 * Too little slack costs one missed overlap for one tick, which the next tick
 * resolves. No slack at all costs jitter that never resolves.
 *
 * Exported for the spec that proves the broad phase never loses a pair.
 */
export function broadPhaseReach(bodies: Entity[]) {
  let maxSize = 0;

  for (const body of bodies) {
    if (body.size > maxSize) maxSize = body.size;
  }

  return maxSize * 3;
}

function separate(
  left: Entity,
  right: Entity,
  delta: Vector,
  distance: number,
  minDistance: number,
  worldSize: Vector,
) {
  // Exactly on top of each other: any direction will do, so pick a fixed one
  // rather than a random one — a tick has to be reproducible.
  const direction = distance === 0 ? vector(1, 0) : delta;
  const push = normalize(direction, (minDistance - distance) / 2);

  left.position = wrapPosition(
    sumVectors(left.position, multiplyVectors(push, -1)),
    worldSize,
  );
  right.position = wrapPosition(sumVectors(right.position, push), worldSize);

  // Trade velocity ALONG THE LINE BETWEEN THEM, and only that. Two cells meeting
  // head-on still stop; two brushing past each other keep the speed that was
  // never aimed at the other one and slide.
  //
  // Swapping the whole velocity vector instead makes the sim feel sluggish: in a
  // herd cells are in near-continuous contact, so every graze — even at a right
  // angle — costs half the speed (2.2 px/tick average against a 3.6 limit).
  const normal = normalize(direction);
  const leftSpeed = dotProduct(left.velocity, normal);
  const rightSpeed = dotProduct(right.velocity, normal);

  // Already moving apart (the overlap is being resolved, or something else
  // pushed them): touching them again only adds jitter.
  if (leftSpeed - rightSpeed <= 0) return;

  const bounce = 1 - COLLISION_FRICTION;

  left.velocity = sumVectors(
    subtractVectors(left.velocity, multiplyVectors(normal, leftSpeed)),
    multiplyVectors(normal, rightSpeed * bounce),
  );

  right.velocity = sumVectors(
    subtractVectors(right.velocity, multiplyVectors(normal, rightSpeed)),
    multiplyVectors(normal, leftSpeed * bounce),
  );
}
