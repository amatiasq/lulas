import {
  alignementBehavior,
  cohesionBehavior,
  separationBehavior,
} from './../src/behaviors/flocking';

import { notEqual, ok } from 'assert';

import { createCell } from '../src/cell';
import { vector, vectorAxis, Vector, getAngle, sumVectors } from '../src/point';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { assertBetween, assertBetweenOrEqual } from '../test/assertions';
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
    // With vector(0) angle would be the same before and after (0)
    [vector(1), vector(1, 0)],
    [vector(0), vector(1)],
    [vector(0), vector(-1, 0)],
    [vector(0), vector(0, -1)],
    [vector(0), vector(-1, -1)],
  ],
  (targetVel, neighborVel) => {
    const lulas = createTestLulas({
      behaviors: [alignementBehavior],
      cells: [
        createCell({ position: vector(10), velocity: { ...targetVel } }),
        createCell({ position: vector(20), velocity: { ...neighborVel } }),
      ],
    });

    const angleBefore = getAngle(targetVel);
    const neighborAngle = getAngle(neighborVel);

    lulas.step();
    const sut = lulas.cells[0];

    const angleAfter = getAngle(sut.velocity);
    notEqual(angleAfter, angleBefore);
    assertBetweenOrEqual(angleAfter, angleBefore, neighborAngle);
  },
);

test(
  'A boid should get closer to nearby neighbors',
  [
    [vector(10)],
    [vector(-10)],
    [vector(15, -15)],
    [vector(-15, 15)],
    // out of range
    // [vector(50), vector(0)],
  ],
  (pos) => {
    const lulas = createTestLulas({
      behaviors: [cohesionBehavior],
      cells: [
        createCell({ position: vector(0), velocity: vector(0), vision: 50 }),
        createCell({ position: { ...pos }, velocity: vector(0) }),
      ],
    });

    lulas.step();

    const sut = lulas.cells[0];
    const angleBefore = 0;
    const angleAfter = getAngle(sut.velocity);

    notEqual(angleAfter, angleBefore);
    assertBetweenOrEqual(angleAfter, angleBefore, getAngle(pos));
  },
);

test(
  'A boid should maintain distance from closer neighbors',
  [
    [vector(10)],
    [vector(10, 5)],
    [vector(-10)],
    [vector(-5, -10)],
    // out of range
    // [vector(49), vector(0)],
  ],
  (pos) => {
    // This checks if the cell position affects the direction
    const cellPosition = vector(-100, 100);

    const lulas = createTestLulas({
      behaviors: [separationBehavior],
      cells: [
        createCell({ position: cellPosition, velocity: vector(0), vision: 50 }),
        createCell({
          position: sumVectors(cellPosition, pos),
          velocity: vector(0),
        }),
      ],
    });

    lulas.step();

    const sut = lulas.cells[0];
    const angleBefore = 0;
    const angleAfter = getAngle(sut.velocity);
    let separationAngle = getAngle(pos) + 180;

    if (separationAngle > 180) {
      separationAngle -= 360;
    }

    notEqual(angleAfter, angleBefore);
    assertBetweenOrEqual(angleAfter, angleBefore, separationAngle);
  },
);
