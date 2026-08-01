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

/**
 * The whole decision, in the order the spec demands.
 *
 * 1. SURVIVAL BEATS LUNCH. A threat in vision wins outright — this is a
 *    priority, not a blend. Summing "toward the plant" and "away from the
 *    carnivore" leaves a herbivore starving between the two or drifting into the
 *    predator. It applies to carnivores too: a small carnivore runs from a big
 *    one rather than weighing it against the herbivore it was chasing.
 * 2. Otherwise go for prey — and eat it if already touching.
 * 3. Otherwise herd with its own kind (`flock`). Last, so it is never summed
 *    with either of the above, and weak enough that it never looks urgent.
 * 4. Otherwise coast. Momentum carries the cell, and moving still costs area,
 *    so idling is not free.
 */
export function decide(
  cell: Entity,
  visible: Entity[],
  size: Vector,
): Intent {
  const threat = nearest(
    cell,
    visible.filter((other) => flees(cell, other)),
    size,
  );

  if (threat) {
    const away = invertVector(
      shortestDelta(cell.position, threat.position, size),
    );

    return { action: 'flee', force: steer(cell, away, ESCAPE_FORCE), target: threat };
  }

  const prey = pickPrey(cell, visible, size);

  if (!prey) {
    const herd = flock(cell, visible, size);
    return isZero(herd) ? { action: 'idle' } : { action: 'flock', force: herd };
  }

  if (isTouching(cell, prey, size)) {
    return { action: 'eat', target: prey };
  }

  const toward = shortestDelta(cell.position, prey.position, size);
  return { action: 'hunt', force: steer(cell, toward, HUNT_FORCE), target: prey };
}

/**
 * Herbivores go for the nearest plant.
 *
 * Carnivores: the nearest herbivore in range wins, whatever its size — a
 * carnivore does not check first, it commits, and a chase it cannot finish is
 * meant to cost it. Only when no herbivore is in range does it consider another
 * carnivore, and then the size rule applies, so it picks a smaller one.
 */
function pickPrey(cell: Entity, visible: Entity[], size: Vector) {
  if (cell.type === 'herbivore') {
    return nearest(
      cell,
      visible.filter((other) => other.type === 'plant'),
      size,
    );
  }

  if (cell.type !== 'carnivore') return null;

  const herbivore = nearest(
    cell,
    visible.filter((other) => other.type === 'herbivore'),
    size,
  );

  if (herbivore) return herbivore;

  return nearest(
    cell,
    visible.filter(
      (other) => other.type === 'carnivore' && canEat(cell, other),
    ),
    size,
  );
}

/** Classic steering: the force that turns the current velocity into the desired one. */
function steer(cell: Entity, direction: Vector, maxForce: number) {
  const desired = normalize(direction, maxSpeedOf(cell));
  return limitVector(subtractVectors(desired, cell.velocity), maxForce);
}
