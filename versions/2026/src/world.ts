import { magnitude, Vector, vector, vectorAxis } from './vector';

export interface World {
  /**
   * The map's width and height. Named `worldSize`, not `size`, because
   * `Entity.size` is a radius: the two turn up in the same function often enough
   * that a bare `size` parameter told you nothing about which one you had.
   */
  worldSize: Vector;
}

export function world(worldSize: Vector): World {
  return { worldSize };
}

/**
 * Wrap a single delta component into `[-max/2, max/2]` — the shortest way round
 * a ring of length `max`. The modulo dance first so it holds for any input, not
 * only for deltas already inside one map width.
 */
function wrapDelta(value: number, max: number) {
  const positive = ((value % max) + max) % max;
  return positive > max / 2 ? positive - max : positive;
}

/**
 * The vector from `from` to `to` taking the wrap into account: two points on
 * either side of an edge get a short delta pointing ACROSS the edge, not a long
 * one pointing back through the middle of the map.
 *
 * Ported from `recover/js-2014/src/map/map.js` → `getShorterDistance`.
 */
export function shortestDelta(from: Vector, to: Vector, worldSize: Vector): Vector {
  return vectorAxis((axis) => wrapDelta(to[axis] - from[axis], worldSize[axis]));
}

export function shortestDistance(from: Vector, to: Vector, worldSize: Vector) {
  return magnitude(shortestDelta(from, to, worldSize));
}

/** Bring a position back inside the map after it walked off an edge. */
export function wrapPosition(position: Vector, worldSize: Vector): Vector {
  return vectorAxis((axis) => {
    const value = position[axis] % worldSize[axis];
    return value < 0 ? value + worldSize[axis] : value;
  });
}

export function randomPosition(worldSize: Vector): Vector {
  return vector(Math.random() * worldSize.x, Math.random() * worldSize.y);
}
