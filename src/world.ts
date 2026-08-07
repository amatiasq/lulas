import { magnitude, Vector, vector, vectorAxis } from './vector';

export interface World {
  /** Never `size`: that is `Entity.size`, a radius, and the two meet constantly. */
  worldSize: Vector;
}

export function world(worldSize: Vector): World {
  return { worldSize };
}

/** The shortest way round a ring of length `max`. Modulo first, so it holds for
 * any input and not only for deltas already inside one map width. */
function wrapDelta(value: number, max: number) {
  const positive = ((value % max) + max) % max;
  return positive > max / 2 ? positive - max : positive;
}

/** Points ACROSS an edge, never back through the middle of the map — invariant 1.
 * From `recover/js-2014/src/map/map.js` → `getShorterDistance`. */
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
