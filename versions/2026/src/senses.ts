import { Entity, visionOf } from './entity';
import { Vector } from './vector';
import { shortestDistance } from './world';

/**
 * Everything inside the cell's vision range. Toroidal: a cell 2px from an edge
 * sees across it — every vision check in the simulation comes through here so
 * there is only one place that could get the wrap wrong.
 */
export function look(cell: Entity, entities: Entity[], worldSize: Vector): Entity[] {
  const range = visionOf(cell);

  return entities.filter(
    (other) =>
      other.id !== cell.id &&
      shortestDistance(cell.position, other.position, worldSize) <= range,
  );
}

export function nearest(
  cell: Entity,
  candidates: Entity[],
  worldSize: Vector,
): Entity | null {
  let best: Entity | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const distance = shortestDistance(
      cell.position,
      candidate.position,
      worldSize,
    );

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}
