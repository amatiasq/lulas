import { equal as assertEqual } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { point, pointAxis } from '../src/point';
import { move } from '../src/behaviors/move';

setFilename(__dirname, __filename);

test(
  'I should be able to create a cell with predefined parameters',
  [[point(0)], [point(1)], [point(2)]],
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
    [point(0), point(1), point(1)],
    [point(0), point(2), point(2)],
    [point(4), point(1), point(5)],
    [point(4), point(2), point(6)],
  ],
  (pos, vel, exp) => {
    const cell = createCell({
      position: { ...pos },
      velocity: { ...vel },
    });
    const sut = createTestLulas({
      cells: [cell],
      behaviors: [move],
    });

    sut.step();

    pointAxis((axis) => assertEqual(cell.position[axis], exp[axis]));
  },
);
