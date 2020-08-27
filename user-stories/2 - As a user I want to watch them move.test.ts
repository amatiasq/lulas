import { equal as assertEqual } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { point, pointAxis } from '../src/point';
import { move } from '../src/behaviors/move';

setFilename(__dirname, __filename);

test(
  'I should be able to create a cell with predefined parameters',
  [[point(0, 0)], [point(1, 1)], [point(2, 2)]],
  (pos) => {
    const cell = createCell({
      position: { ...pos },
    });

    pointAxis((axis) => assertEqual(cell.position[axis], pos[axis], axis));
  },
);

test(
  'The game will execute a cell step',
  [
    [point(10, 10), point(1, 1), point(11, 11)],
    [point(10, 10), point(2, 2), point(12, 12)],
    [point(14, 14), point(1, 1), point(15, 15)],
    [point(14, 14), point(2, 2), point(16, 16)],
  ],
  (pos, vel, exp) => {
    const cell = createCell({
      position: { x: pos.x, y: pos.y },
      velocity: { x: vel.x, y: vel.y },
    });
    const sut = createTestLulas({
      cells: [cell],
      behaviors: [move],
    });

    sut.step();

    pointAxis((axis) => assertEqual(cell.position[axis], exp[axis], axis));
  },
);
