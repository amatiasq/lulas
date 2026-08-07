import { Rectangle } from '@amatiasq/geometry';
import { IQuadEntity, Quadtree } from '@amatiasq/quadtree';
import { Entity } from './entity';
import { Vector } from './vector';

/**
 * BROAD PHASE ONLY: what comes back is a superset, because the queries are
 * rectangular and this world's questions are circular and toroidal. Callers keep
 * their own predicate — that is why this returns candidates, not answers.
 */
export interface EntityIndex {
  candidatesNear(centre: Vector, radius: number): Entity[];
  /** For the debug overlay only — a spatial index you cannot see is one you have
   * to take on faith. */
  quadrants(): Rectangle[];
}

interface IndexedEntity extends IQuadEntity {
  entity: Entity;
}

const EMPTY: Entity[] = [];
const NO_QUADRANTS: Rectangle[] = [];

export function indexEntities(
  entities: Entity[],
  worldSize: Vector,
): EntityIndex {
  if (entities.length === 0) {
    return { candidatesNear: () => EMPTY, quadrants: () => NO_QUADRANTS };
  }

  // THE WORLD, not the bounding box of the entities: measured bounds shift every
  // tick, so every quadrant line moves and the debug grid crawls. Widened only
  // as a guard, because `Quadnode` throws on an entity its root does not hold.
  let left = 0;
  let top = 0;
  let right = worldSize.x;
  let bottom = worldSize.y;

  for (const { position } of entities) {
    if (position.x < left) left = position.x;
    if (position.x > right) right = position.x;
    if (position.y < top) top = position.y;
    if (position.y > bottom) bottom = position.y;
  }

  // A pixel of air on every side: `Rectangle` derives its edges from a centre
  // and a half-width, so an entity sitting exactly on the bounds it was measured
  // from can round to just outside them, and `Quadnode` throws rather than clamp.
  const pad = 1;

  const tree = new Quadtree(
    // Everything in a single column is a zero-width world, which halves into
    // zero-width quadrants for as many levels as it is allowed.
    Math.max(right - left, 1) + pad * 2,
    Math.max(bottom - top, 1) + pad * 2,
    { offsetX: left - pad, offsetY: top - pad },
  );

  for (const entity of entities) {
    // Points, not discs. Both predicates downstream measure centre to centre,
    // so inserting the body's radius would only widen the candidate set; where
    // the radius matters (collisions) the caller pads its own query instead.
    const indexed: IndexedEntity = {
      entity,
      top: entity.position.y,
      bottom: entity.position.y,
      left: entity.position.x,
      right: entity.position.x,
    };

    tree.add(indexed);
  }

  return {
    quadrants() {
      return tree.quadrants;
    },

    candidatesNear(centre: Vector, radius: number) {
      const xs = spans(centre.x, radius, worldSize.x, left, right);
      const ys = spans(centre.y, radius, worldSize.y, top, bottom);

      // Up to four boxes: a corner query reaches around both seams. Dropping the
      // wrap is a silent regression — every vision check here is toroidal.
      const found = new Set<Entity>();

      for (const [x0, x1] of xs) {
        for (const [y0, y1] of ys) {
          const range = Rectangle.fromCoords(y0, x0, x1, y1);

          for (const match of tree.getAt(range) as IndexedEntity[]) {
            found.add(match.entity);
          }
        }
      }

      return [...found];
    },
  };
}

/** The one or two intervals a `centre ± radius` reach covers on a ring of length
 * `size`; two when it crosses the seam and comes back at the other end. */
function spans(
  centre: number,
  radius: number,
  size: number,
  min: number,
  max: number,
): [number, number][] {
  // The reach meets itself: splitting would double-count, so answer the lot.
  if (radius * 2 >= size) return [[min, max]];

  const low = centre - radius;
  const high = centre + radius;

  if (low < 0) return [[0, high], [low + size, size]];
  if (high > size) return [[low, size], [0, high - size]];

  return [[low, high]];
}
