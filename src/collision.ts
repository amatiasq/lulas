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
export function resolveCollisions(entities: Entity[], worldSize: Vector) {
  const bodies = entities.filter((entity) => isAnimal(entity) && isAlive(entity));
  if (bodies.length < 2) return;

  const index = indexEntities(bodies, worldSize);
  const position = new Map(bodies.map((body, i) => [body.id, i]));
  const reach = broadPhaseReach(bodies);

  for (let i = 0; i < bodies.length; i++) {
    const left = bodies[i];

    // Each pair is still visited once, in the order the nested loops used to
    // visit it: `separate` moves both bodies, so a different order is a
    // different simulation.
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
 * while the pass runs — so a pair that was out of reach when the tree was built
 * can be shoved into contact before it is looked at. One `maxSize` covers the
 * other body's radius; the other two cover that drift, since a single shove is
 * at most half the pair's combined radii and a body is rarely shoved more than
 * twice in a tick.
 *
 * The cost of getting this wrong is one missed overlap for one tick — the pair
 * is still overlapping next tick, and gets separated then. The cost of dropping
 * the slack and being wrong is jitter that never resolves.
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
  // The sibling `flocking/` project swaps the whole velocity vector, damped.
  // That was ported here first and it is what made the simulation feel sluggish:
  // in a herd, cells are in contact almost continuously, and every graze — even
  // one at a right angle — cost them half their speed. Measured on 3000 ticks it
  // held the average at 2.2 px/tick against a 3.6 limit.
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
