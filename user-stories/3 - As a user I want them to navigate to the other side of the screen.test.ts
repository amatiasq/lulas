import { test, setFilename } from '../test/index';
import { vector, vectorAxis } from '../src/vector';
import { createCell } from '../src/cell';
import { createTestLulas } from '../test/test-duplicates';
import { equal } from 'assert';
import { roundMap } from '../src/behaviors/roundMap';

setFilename(__dirname, __filename);

const SIZE = 200;

test(
  "A cell must navigate to the other side of the screen if they're pass the map limit",
  [
    [vector(0, SIZE + 1), vector(0, 1)],
    [vector(SIZE + 1, 0), vector(1, 0)],
    [vector(SIZE + 1), vector(1)],
    [vector(0, -1), vector(0, SIZE - 1)],
    [vector(-1, 0), vector(SIZE - 1, 0)],
    [vector(-1), vector(SIZE - 1)],
  ],
  (pos, exp) => {
    const cell = createCell({ position: { ...pos } });
    const sut = createTestLulas({
      behaviors: [roundMap],
      cells: [cell],
      worldSize: vector(SIZE),
    });

    sut.step();

    vectorAxis((axis) => equal(cell.position[axis], exp[axis]));
  },
);
