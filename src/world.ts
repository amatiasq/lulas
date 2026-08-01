import { magnitude, Vector, vector, vectorAxis } from './vector';

export interface World {
  size: Vector;
}

export function world(size: Vector): World {
  return { size };
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
export function shortestDelta(from: Vector, to: Vector, size: Vector): Vector {
  return vectorAxis((axis) => wrapDelta(to[axis] - from[axis], size[axis]));
}

export function shortestDistance(from: Vector, to: Vector, size: Vector) {
  return magnitude(shortestDelta(from, to, size));
}

/** Bring a position back inside the map after it walked off an edge. */
export function wrapPosition(position: Vector, size: Vector): Vector {
  return vectorAxis((axis) => {
    const value = position[axis] % size[axis];
    return value < 0 ? value + size[axis] : value;
  });
}

export function randomPosition(size: Vector): Vector {
  return vector(Math.random() * size.x, Math.random() * size.y);
}
