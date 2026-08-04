import { Entity, visionOf } from './entity';
import { EntityIndex } from './spatial';
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

/**
 * `look`, asked of a spatial index instead of of the whole world: the index
 * narrows the field to the cells whose rectangle could be in range, and `look`
 * itself still decides. Same answer, without measuring the distance to every
 * plant on the map — which is what made this O(n²) per tick.
 *
 * The predicate deliberately stays in `look`. An index that also filtered would
 * be a second place the wrap could be got wrong.
 */
export function lookAround(
  cell: Entity,
  index: EntityIndex,
  worldSize: Vector,
): Entity[] {
  return look(
    cell,
    index.candidatesNear(cell.position, visionOf(cell)),
    worldSize,
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
