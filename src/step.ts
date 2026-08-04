import { decide } from './behavior';
import { resolveCollisions } from './collision';
import { canEat } from './diet';
import { Entity, isAlive } from './entity';
import {
  applyForce,
  bite,
  burnMovementEnergy,
  canSplit,
  grow,
  move,
  split,
} from './life';
import { lookAround } from './senses';
import { indexEntities } from './spatial';
import { World } from './world';

/**
 * One tick of the world, as a pure-ish function: it mutates the entities it is
 * given and returns the next generation (splits added, the dead dropped).
 *
 * Perception reads a SNAPSHOT taken before anything moves — a double buffer, so
 * a cell reacts to the frame it saw, not to a world half-updated by the cells
 * that happened to be earlier in the array. Eating and movement then apply to
 * the live entities, matched back by id.
 */
export function step(entities: Entity[], world: World): Entity[] {
  const { worldSize } = world;
  const seen = entities.map(snapshot);
  const live = new Map(entities.map((entity) => [entity.id, entity]));

  // Indexed once, off the same snapshot perception reads. Nothing in the
  // perception loop moves anything, so the tree stays true for the whole pass.
  const index = indexEntities(seen, worldSize);

  for (const perceived of seen) {
    const cell = live.get(perceived.id)!;

    if (!isAlive(cell)) continue;

    if (cell.type === 'plant') {
      grow(cell);
      continue;
    }

    const intent = decide(
      perceived,
      lookAround(perceived, index, worldSize),
      worldSize,
    );

    if (intent.action === 'idle') continue;

    if (intent.action === 'eat') {
      // Re-check against the LIVE prey: it may have been eaten, or have
      // shrunk past the point where this cell is allowed to eat it, earlier in
      // this same tick.
      const prey = live.get(intent.target.id)!;
      if (isAlive(prey) && canEat(cell, prey)) bite(cell, prey);
      continue;
    }

    applyForce(cell, intent.force);
  }

  for (const cell of entities) {
    if (cell.type === 'plant' || !isAlive(cell)) continue;

    move(cell, worldSize);
    burnMovementEnergy(cell);
  }

  // After everyone has moved, not during: resolving overlaps as they appear
  // would give the cells earlier in the array a free shove.
  resolveCollisions(entities, worldSize);

  const next: Entity[] = [];

  for (const cell of entities) {
    // Eaten to nothing, or starved. Either way it leaves the world here.
    if (!isAlive(cell)) continue;

    if (canSplit(cell)) next.push(...split(cell, worldSize));
    else next.push(cell);
  }

  return next;
}

function snapshot(entity: Entity): Entity {
  return {
    ...entity,
    position: { ...entity.position },
    velocity: { ...entity.velocity },
    acceleration: { ...entity.acceleration },
  };
}
