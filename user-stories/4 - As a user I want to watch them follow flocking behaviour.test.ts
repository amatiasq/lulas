import { equal, notEqual } from 'assert';

import {
  alignementBehavior as alignementBehavior1,
  cohesionBehavior as cohesionBehavior1,
  separationBehavior as separationBehavior1,
} from '../src/behaviors/flocking';
import {
  alignementBehavior as alignementBehavior2,
  cohesionBehavior as cohesionBehavior2,
  separationBehavior as separationBehavior2,
} from '../src/behaviors/flocking2';
import { move } from '../src/behaviors/move';
import { createCell } from '../src/cell';
import { getAngle, sumVectors, vector, vectorAxis } from '../src/vector';
import { assertBetweenOrEqual } from '../test/assertions';
import { setFilename, test } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';

// GLOSSARY: Boid = Cell

setFilename(__dirname, __filename);

[
  {
    name: 'flocking',
    alignementBehavior: alignementBehavior1,
    cohesionBehavior: cohesionBehavior1,
    separationBehavior: separationBehavior1,
  },
  {
    name: 'flocking2',
    alignementBehavior: alignementBehavior2,
    cohesionBehavior: cohesionBehavior2,
    separationBehavior: separationBehavior2,
  },
].forEach(
  ({ name, alignementBehavior, cohesionBehavior, separationBehavior }) => {
    test(`${name} - Each boid velocity should be independent`, () => {
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
      `${name} - A boid should align to it's neighbors`,
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
      `${name} - A boid should get closer to nearby neighbors`,
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
            createCell({
              position: vector(0),
              velocity: vector(0),
              vision: 50,
            }),
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
      `${name} - A boid should maintain distance from closer neighbors`,
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
            createCell({
              position: cellPosition,
              velocity: vector(0),
              vision: 50,
            }),
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
  },
);
