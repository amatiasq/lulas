import * as assert from 'assert';

import { solidBody } from '../src/behaviors/solidBody';
import { createCell } from '../src/cell';
import { point, pointAxis } from '../src/point';
import { setFilename, test } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test(
  'Cells should immediately separate each other if they overlap',
  [
    [point(1, 0), point(-1, 0), point(5, 0)],
    [point(0, 1), point(0, -1), point(0, 5)],
    [point(1), point(-1), point(3.5355339059327378)],
  ],
  (pos1, pos2, expected) => {
    const lulas = createTestLulas({
      behaviors: [solidBody],
      cells: [
        createCell({ position: { ...pos1 }, velocity: point(0) }),
        createCell({ position: { ...pos2 }, velocity: point(0) }),
      ],
    });

    lulas.step();
    const sut = lulas.cells[0];

    pointAxis((axis) => assert.equal(sut.position[axis], expected[axis]));
  },
);

test('Cells should stop if they collide on each other', () => {
  const lulas = createTestLulas({
    behaviors: [solidBody],
    cells: [
      createCell({ position: point(1), velocity: point(-1) }),
      createCell({ position: point(-1), velocity: point(0) }),
    ],
  });

  lulas.step();
  const sut = lulas.cells[0];

  pointAxis((axis) => assert(sut.velocity[axis] >= 0));
});
