import { Rectangle } from '@amatiasq/geometry';
import { IQuadEntity, Quadtree } from '@amatiasq/quadtree';
import { Entity } from './entity';
import { Vector } from './vector';

/**
 * A frozen snapshot of where everything was, answering "what is near here?"
 * without touching the rest of the world. Rebuilt from scratch each time it is
 * needed — everything has moved since the last one, and a tree that is half
 * this frame and half the previous one is worse than no tree.
 *
 * BROAD PHASE ONLY. What comes back is a superset: the query is a rectangle (or
 * several, at the seams), the real questions are circular and toroidal. Callers
 * must keep their own predicate — `senses.look` and `resolveCollisions` do, and
 * they are the reason this returns candidates instead of answers.
 */
export interface EntityIndex {
  candidatesNear(centre: Vector, radius: number): Entity[];
  /**
   * Every box the tree split itself into, for the debug overlay. Nothing in the
   * simulation reads it: where the tree divided is invisible from the outside —
   * the answers are the same either way — and a spatial index you cannot see is
   * one you have to take on faith.
   */
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

  // THE WORLD, not the bounding box of the entities. Measured bounds shift by a
  // pixel or two every tick — one cell wandering towards an edge drags the whole
  // root with it — so every quadrant line moves every frame, and a cell changes
  // quadrant because something else moved. Invisible until the debug overlay
  // draws the grid, at which point the whole thing crawls.
  //
  // Widened to hold anything that strayed outside, because `Quadnode` throws on
  // an entity its root does not contain rather than clamping. Positions are
  // wrapped before every call, so this is a guard, not the normal case: while
  // nothing is out, the root is exactly the world and the grid stands still.
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

  // A pixel of air on every side. `Rectangle` stores a centre and a half-width
  // and derives the edges back from them, so an entity sitting exactly on the
  // bounding box it was measured from can land a rounding error outside it —
  // and `Quadnode` throws rather than clamp. Nothing here is precise to a pixel.
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

      // Up to four boxes: a query near a corner reaches around both seams, and
      // the corner diagonally opposite is inside all the same. Dropping the
      // wrap here would be a silent regression — every vision check in this
      // simulation is toroidal.
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

/**
 * The one or two intervals a `centre ± radius` reach covers on a ring of length
 * `size`, clamped to what the tree actually holds. Two when the reach crosses
 * the seam: the part that fell off one end comes back at the other.
 */
function spans(
  centre: number,
  radius: number,
  size: number,
  min: number,
  max: number,
): [number, number][] {
  // The reach goes all the way round and meets itself. Splitting would produce
  // overlapping boxes and double-counted candidates; the whole extent is the
  // honest answer.
  if (radius * 2 >= size) return [[min, max]];

  const low = centre - radius;
  const high = centre + radius;

  if (low < 0) return [[0, high], [low + size, size]];
  if (high > size) return [[low, size], [0, high - size]];

  return [[low, high]];
}
