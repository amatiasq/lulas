import { equal as assertEqual } from 'assert';

import { createCell, stepCell } from '../src/cell';
import { test, setFilename } from '../test';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test(
  'I should be able to create a cell with predefined parameters',
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  (x, y) => {
    const cell = createCell({
      position: { x, y },
    });

    assertEqual(cell.position.x, x);
    assertEqual(cell.position.y, y);
  },
);

test(
  "A cell with velocity should update it's position when stepCell() is invoked",
  [
    [10, 10, 1, 1, 11, 11],
    [10, 10, 2, 2, 12, 12],
    [14, 14, 1, 1, 15, 15],
    [14, 14, 2, 2, 16, 16],
  ],
  (posx, posy, velx, vely, expx, expy) => {
    const cell = createCell({
      position: { x: posx, y: posy },
      velocity: { x: velx, y: vely },
    });

    stepCell(cell);

    assertEqual(cell.position.x, expx);
    assertEqual(cell.position.y, expy);
  },
);

test(
  'The game will execute a cell step',
  [
    [10, 10, 1, 1, 11, 11],
    [10, 10, 2, 2, 12, 12],
    [14, 14, 1, 1, 15, 15],
    [14, 14, 2, 2, 16, 16],
  ],
  (posx, posy, velx, vely, expx, expy) => {
    const cell = createCell({
      position: { x: posx, y: posy },
      velocity: { x: velx, y: vely },
    });
    const sut = createTestLulas({ cells: [cell] });

    sut.step();

    assertEqual(cell.position.x, expx);
    assertEqual(cell.position.y, expy);
  },
);
