import { equal as assertEqual } from 'assert';
import { test } from './test';
import { createCell, stepCell } from '../src/cell';

test(
  "A cell with velocity should update it's position when stepCell() is invoked",
  [
    [0, 0, 1, 1, 1, 1],
    [0, 0, 2, 2, 2, 2],
    [4, 4, 1, 1, 5, 5],
    [4, 4, 2, 2, 6, 6],
  ],
  (posx, posy, velx, vely, expx, expy) => {
    const cell = createCell({
      position: { x: posx, y: posy },
      velocity: { x: velx, y: vely },
    });

    assertEqual(cell.position.x, posx);
    assertEqual(cell.position.y, posy);

    stepCell(cell);

    assertEqual(cell.position.x, expx);
    assertEqual(cell.position.y, expy);
  },
);
