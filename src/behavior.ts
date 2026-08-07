import { ESCAPE_FORCE, HUNT_FORCE } from './CONFIGURATION';
import { canEat, flees } from './diet';
import { Entity, isTouching, maxSpeedOf } from './entity';
import { flock } from './flock';
import { nearest } from './senses';
import {
  invertVector,
  isZero,
  limitVector,
  normalize,
  subtractVectors,
  Vector,
} from './vector';
import { shortestDelta } from './world';

export type Intent =
  | { action: 'idle' }
  | { action: 'flock'; force: Vector }
  | { action: 'flee' | 'hunt'; force: Vector; target: Entity }
  | { action: 'eat'; target: Entity };

/** Flee, else hunt or eat, else herd, else coast. A strict priority and never a
 * blend of forces, for every species — AGENTS.md invariant 3. */
export function decide(
  cell: Entity,
  visible: Entity[],
  worldSize: Vector,
): Intent {
  const threat = nearest(
    cell,
    visible.filter((other) => flees(cell, other)),
    worldSize,
  );

  if (threat) {
    const away = invertVector(
      shortestDelta(cell.position, threat.position, worldSize),
    );

    return { action: 'flee', force: steer(cell, away, ESCAPE_FORCE), target: threat };
  }

  const prey = pickPrey(cell, visible, worldSize);

  if (!prey) {
    const herd = flock(cell, visible, worldSize);
    return isZero(herd) ? { action: 'idle' } : { action: 'flock', force: herd };
  }

  if (isTouching(cell, prey, worldSize)) {
    return { action: 'eat', target: prey };
  }

  const toward = shortestDelta(cell.position, prey.position, worldSize);
  return { action: 'hunt', force: steer(cell, toward, HUNT_FORCE), target: prey };
}

/** The nearest herbivore wins whatever its size: a carnivore commits instead of
 * checking, and a chase it cannot finish is meant to cost it. */
function pickPrey(cell: Entity, visible: Entity[], worldSize: Vector) {
  if (cell.type === 'herbivore') {
    return nearest(
      cell,
      visible.filter((other) => other.type === 'plant'),
      worldSize,
    );
  }

  if (cell.type !== 'carnivore') return null;

  const herbivore = nearest(
    cell,
    visible.filter((other) => other.type === 'herbivore'),
    worldSize,
  );

  if (herbivore) return herbivore;

  return nearest(
    cell,
    visible.filter(
      (other) => other.type === 'carnivore' && canEat(cell, other),
    ),
    worldSize,
  );
}

/** Classic steering: the force that turns the current velocity into the desired one. */
function steer(cell: Entity, direction: Vector, maxForce: number) {
  const desired = normalize(direction, maxSpeedOf(cell));
  return limitVector(subtractVectors(desired, cell.velocity), maxForce);
}
