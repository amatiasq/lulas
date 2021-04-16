import { ok } from 'assert';

import { attractor } from '../src/behaviors/attractor';
import { createCell } from '../src/cell';
import { getAngle, isZero, vector } from '../src/vector';
import { assertBetweenOrEqual } from '../test/assertions';
import { setFilename, test } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test(
  'Cells should steer to the attractor',
  [
    // Cases
    [vector(10)],
    [vector(-10)],
    [vector(10, -10)],
    [vector(-10, 10)],
  ],
  (pos) => {
    const lulas = createTestLulas({
      behaviors: [attractor(pos)],
      cells: [createCell({ position: vector(0) })],
    });

    lulas.step();

    const sut = lulas.cells[0];
    ok(!isZero(sut.acceleration));
    assertBetweenOrEqual(getAngle(sut.acceleration), 0, getAngle(pos));
  },
);
