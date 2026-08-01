import { equal, ok } from 'assert';

import { vector, Vector } from '../src/vector';
import { shortestDelta, shortestDistance, wrapPosition } from '../src/world';
import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

const SIZE = vector(200, 100);

test(
  'Two points either side of an edge are close, not a map apart',
  [
    // [from, to, expected distance]
    [vector(198, 50), vector(2, 50), 4],
    [vector(2, 50), vector(198, 50), 4],
    [vector(100, 98), vector(100, 2), 4],
    [vector(100, 2), vector(100, 98), 4],
  ],
  (from: Vector, to: Vector, expected: number) => {
    equal(shortestDistance(from, to, SIZE), expected);
  },
);

test(
  'The direction points across the edge, not back through the middle',
  [
    // [from, to, expected delta]
    [vector(198, 50), vector(2, 50), vector(4, 0)],
    [vector(2, 50), vector(198, 50), vector(-4, 0)],
    [vector(100, 98), vector(100, 2), vector(0, 4)],
    [vector(100, 2), vector(100, 98), vector(0, -4)],
    // Both axes at once: opposite corners are neighbours.
    [vector(199, 99), vector(1, 1), vector(2, 2)],
    [vector(1, 1), vector(199, 99), vector(-2, -2)],
  ],
  (from: Vector, to: Vector, expected: Vector) => {
    equal(shortestDelta(from, to, SIZE).x, expected.x);
    equal(shortestDelta(from, to, SIZE).y, expected.y);
  },
);

test('Corner to opposite corner is a short hop, not the map diagonal', () => {
  const naive = Math.hypot(SIZE.x, SIZE.y);
  ok(shortestDistance(vector(199, 99), vector(1, 1), SIZE) < naive / 10);
});

test('Points inside the map keep their naive distance', () => {
  equal(shortestDistance(vector(10, 10), vector(13, 14), SIZE), 5);
});

test(
  'A position past an edge comes back on the other side',
  [
    [vector(201, 50), vector(1, 50)],
    [vector(-1, 50), vector(199, 50)],
    [vector(100, 101), vector(100, 1)],
    [vector(100, -1), vector(100, 99)],
  ],
  (position: Vector, expected: Vector) => {
    const wrapped = wrapPosition(position, SIZE);
    equal(wrapped.x, expected.x);
    equal(wrapped.y, expected.y);
  },
);
