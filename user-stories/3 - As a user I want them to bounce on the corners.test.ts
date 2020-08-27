import { equal } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { pointAxis } from '../src/point';
import { roundMap } from '../src/behaviors/roundMap';

setFilename(__dirname, __filename);

test('A cell in (0,0) will have position adjusted to fit the screen', () => {
  const cell = createCell({ position: { x: 0, y: 0 }, radius: 5 });
  const sut = createTestLulas({
    behaviors: [roundMap],
    cells: [cell],
  });

  sut.step();

  pointAxis((axis) => equal(cell.position[axis], 5, axis));
});

test('A cell in (0,0) will have velocity adjusted to bounce on screen', () => {
  const cell = createCell({
    position: { x: 0, y: 0 },
    velocity: { x: -1, y: -1 },
  });
  const sut = createTestLulas({
    behaviors: [roundMap],
    cells: [cell],
  });

  sut.step();

  pointAxis((axis) => equal(cell.velocity[axis], 1, axis));
});

test('A cell outside of the window will have position adjusted to fit the screen', () => {
  const size = 200;
  const cell = createCell({ position: { x: size, y: size }, radius: 5 });
  const sut = createTestLulas({
    behaviors: [roundMap],
    cells: [cell],
    worldSize: { x: size, y: size },
  });

  sut.step();

  pointAxis((axis) => equal(cell.position[axis], 195, axis));
});

test('A cell outside of the window will have velocity adjusted to bounce on screen', () => {
  const size = 200;
  const cell = createCell({
    position: { x: size, y: size },
    velocity: { x: 1, y: 1 },
  });
  const sut = createTestLulas({
    behaviors: [roundMap],
    cells: [cell],
    worldSize: { x: size, y: size },
  });

  sut.step();

  pointAxis((axis) => equal(cell.velocity[axis], -1, axis));
});
