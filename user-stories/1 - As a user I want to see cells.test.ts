import * as assert from 'assert';

import { CanvasRenderingContext2DEvent } from '../node_modules/jest-canvas-mock/types/index.d';
import { createCell } from '../src/cell';
import { isJestTesting, setFilename, test } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test('Should render something', () => {
  const canvas = document.createElement('canvas');
  const lulas = createTestLulas({ canvas });
  const isCanvasBlank = isJestTesting
    ? isCanvasBlank_mock
    : isCanvasBlank_browser;

  lulas.render();
  assert(!isCanvasBlank(canvas));
});

test('Cells should be instanciable', () => {
  const cell = createCell();
  assert(cell);
});

function isCanvasBlank_browser(canvas: HTMLCanvasElement) {
  return !canvas
    .getContext('2d')!
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0);
}

function isCanvasBlank_mock(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')!;
  return (context as any).__getEvents().every(
    (x: CanvasRenderingContext2DEvent) =>
      x.type === 'fillStyle' ||
      x.type === 'strokeStyle' ||
      // ((console.log(x.type, /^(fill|stroke)/.test(x.type)) as any) || true) ||
      !/^(fill|stroke)/.test(x.type),
  );
}
