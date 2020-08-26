import * as assert from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test('Should render something', () => {
  const canvas = document.createElement('canvas');
  const lulas = createTestLulas({ canvas });

  lulas.render();
  assert(!isCanvasBlank(canvas));

  function isCanvasBlank(canvas: HTMLCanvasElement) {
    return !canvas
      .getContext('2d')!
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.some((channel) => channel !== 0);
  }
});

test('Cells should be instanciable', () => {
  const cell = createCell();
  assert(cell);
});
