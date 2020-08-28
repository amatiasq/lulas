import * as assert from 'assert';

import { solidBody } from '../src/behaviors/solidBody';
import { createCell } from '../src/cell';
import { vector, vectorAxis } from '../src/point';
import { setFilename, test } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test(
  'Cells should immediately separate each other if they overlap',
  [
    [vector(1, 0), vector(-1, 0), vector(5, 0)],
    [vector(0, 1), vector(0, -1), vector(0, 5)],
    [vector(1), vector(-1), vector(3.5355339059327378)],
  ],
  (pos1, pos2, expected) => {
    const lulas = createTestLulas({
      behaviors: [solidBody],
      cells: [
        createCell({ position: { ...pos1 }, velocity: vector(0) }),
        createCell({ position: { ...pos2 }, velocity: vector(0) }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    vectorAxis((axis) => assert.equal(sut.position[axis], expected[axis]));
  },
);

test('Cells should stop if they collide on each other', () => {
  const lulas = createTestLulas({
    behaviors: [solidBody],
    cells: [
      createCell({ position: vector(1), velocity: vector(-1) }),
      createCell({ position: vector(-1), velocity: vector(0) }),
    ],
  });

  lulas.step();
  const sut = lulas.cells[0];

  vectorAxis((axis) => assert(sut.velocity[axis] >= 0));
});
