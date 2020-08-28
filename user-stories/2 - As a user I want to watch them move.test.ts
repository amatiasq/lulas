import { equal as assertEqual } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { vector, vectorAxis } from '../src/point';
import { move } from '../src/behaviors/move';

setFilename(__dirname, __filename);

test(
  'I should be able to create a cell with predefined parameters',
  [[vector(0)], [vector(1)], [vector(2)]],
  (pos) => {
    const cell = createCell({
      position: { ...pos },
    });

    vectorAxis((axis) => assertEqual(cell.position[axis], pos[axis], axis));
  },
);

test(
  'The game will execute a cell step',
  [
    [vector(0), vector(1), vector(1)],
    [vector(0), vector(2), vector(2)],
    [vector(4), vector(1), vector(5)],
    [vector(4), vector(2), vector(6)],
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

    vectorAxis((axis) => assertEqual(cell.position[axis], exp[axis]));
  },
);
