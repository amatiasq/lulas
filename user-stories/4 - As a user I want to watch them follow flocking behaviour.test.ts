import {
  alignementBehavior,
  cohesionBehavior,
  separationBehavior,
} from './../src/behaviors/flocking';

import { createCell } from '../src/cell';
import { vector, vectorAxis, Vector } from '../src/point';
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
      createCell({ position: vector(10), velocity: vector(-1, -1) }),
      createCell({ position: vector(20), velocity: vector(1) }),
    ],
  });

  lulas.step();
  const [first, second] = lulas.cells;

  vectorAxis((axis) => equal(first.velocity[axis], -1));
  vectorAxis((axis) => equal(second.velocity[axis], 1));
});

test(
  "A boid should align to it's neighbors",
  [
    [vector(0), vector(0, 1)],
    [vector(1), vector(1, 0)],
    [vector(2), vector(1)],
    [vector(3), vector(-1, 0)],
    [vector(4), vector(0, -1)],
    [vector(5), vector(-1, -1)],
  ],
  (targetVel, neighborVel) => {
    const lulas = createTestLulas({
      behaviors: [alignementBehavior],
      cells: [
        createCell({ position: vector(10), velocity: { ...targetVel } }),
        createCell({ position: vector(20), velocity: { ...neighborVel } }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    vectorAxis((axis) =>
      assertBetween(
        sut.velocity[axis],
        targetVel[axis],
        neighborVel[axis],
        axis,
      ),
    );
  },
);

test(
  'A boid should get closer to nearby neighbors',
  [
    [vector(10), vector(1)],
    [vector(-10), vector(-1)],
    [vector(15, -15), vector(1, -1)],
    [vector(-15, 15), vector(-1, 1)],
    // out of range
    [vector(50), vector(0)],
  ],
  (pos, expected) => {
    const lulas = createTestLulas({
      behaviors: [cohesionBehavior],
      cells: [
        createCell({ position: vector(0), velocity: vector(0), vision: 50 }),
        createCell({ position: { ...pos }, velocity: vector(0) }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    vectorAxis((axis) =>
      assertBetween(sut.velocity[axis], 0, expected[axis], axis),
    );
  },
);

test(
  'A boid should maintain distance from closer neighbors',
  [
    [vector(10), vector(-1)],
    [vector(-10), vector(1)],
    // out of range
    [vector(49), vector(0)],
  ],
  (pos, expected) => {
    const lulas = createTestLulas({
      behaviors: [separationBehavior],
      cells: [
        createCell({ position: vector(0), velocity: vector(0), vision: 50 }),
        createCell({ position: { ...pos }, velocity: vector(0) }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    vectorAxis((axis) =>
      assertBetween(sut.velocity[axis], 0, expected[axis], axis),
    );
  },
);
