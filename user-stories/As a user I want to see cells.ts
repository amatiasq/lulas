import * as assert from 'assert';
import { test } from './test';
import lulas from '../src/lulas';

test('Should render something', () => {
  const canvas = document.createElement('canvas');

  lulas(canvas);
  assert(!isCanvasBlank(canvas));

  function isCanvasBlank(canvas: HTMLCanvasElement) {
    return !canvas
      .getContext('2d')!
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.some((channel) => channel !== 0);
  }
});
