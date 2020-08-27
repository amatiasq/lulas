import {
  alignementBehaviour,
  cohesionBehaviour,
} from './../src/behaviors/flocking';

import { createCell } from '../src/cell';
import { point, pointAxis } from '../src/point';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { assertBetween } from '../test/assertions';
import { equal } from 'assert';
import { move } from '../src/behaviors/move';

// GLOSSARY: Boid = Cell

setFilename(__dirname, __filename);

test('Each boid velocity should be independent', () => {
  const lulas = createTestLulas({
    behaviors: [move],
    cells: [
      createCell({ position: point(10, 10), velocity: point(-1, -1) }),
      createCell({ position: point(20, 20), velocity: point(1, 1) }),
    ],
  });

  lulas.step();
  const [first, second] = lulas.cells;

  pointAxis((axis) => equal(first.velocity[axis], -1));
  pointAxis((axis) => equal(second.velocity[axis], 1));
});

test(
  "A boid should align to it's neighbors",
  [
    [point(0, 0), point(0, 1)],
    [point(1, 1), point(1, 0)],
    [point(2, 2), point(1, 1)],
    [point(3, 3), point(-1, 0)],
    [point(4, 4), point(0, -1)],
    [point(5, 5), point(-1, -1)],
  ],
  (targetVel, neighborVel) => {
    const lulas = createTestLulas({
      behaviors: [alignementBehaviour],
      cells: [
        createCell({ position: point(10, 10), velocity: { ...targetVel } }),
        createCell({ position: point(20, 20), velocity: { ...neighborVel } }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    pointAxis((axis) =>
      assertBetween(
        sut.velocity[axis],
        targetVel[axis],
        neighborVel[axis],
        axis,
      ),
    );
  },
);

test('A boid should get closer to nearby neighbors', () => {
  const lulas = createTestLulas({
    behaviors: [cohesionBehaviour],
    cells: [
      createCell({ position: point(10, 10), velocity: point(0, 0) }),
      createCell({ position: point(20, 20), velocity: point(0, 0) }),
    ],
  });

  lulas.step();
  const sut = lulas.cells[0];

  pointAxis((axis) => assertBetween(sut.velocity[axis], 0, 1, axis));
});

// TODO: tests for Separation
