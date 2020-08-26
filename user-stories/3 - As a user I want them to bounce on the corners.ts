import { equal } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test('A cell in (0,0) will be adjusted to fit the screen', () => {
  const cell = createCell({ position: { x: 0, y: 0 }, radius: 5 });
  const sut = createTestLulas({ cells: [cell] });

  sut.step();

  equal(cell.position.x, 5);
  equal(cell.position.y, 5);
});
