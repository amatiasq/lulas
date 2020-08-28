import { equal } from 'assert';

import { createCell } from '../src/cell';
import { test, setFilename } from '../test/index';
import { createTestLulas } from '../test/test-duplicates';
import { vectorAxis, vector } from '../src/point';
import { bounceOnCorners } from '../src/behaviors/bounceOnCorners';

setFilename(__dirname, __filename);

test('A cell in (0,0) will have position adjusted to fit the screen', () => {
  const cell = createCell({ radius: 5 });
  const sut = createTestLulas({
    behaviors: [bounceOnCorners],
    cells: [cell],
  });

  sut.step();

  vectorAxis((axis) => equal(cell.position[axis], 5, axis));
});

test('A cell in (0,0) will have velocity adjusted to bounce on screen', () => {
  const cell = createCell({ velocity: vector(-1) });
  const sut = createTestLulas({
    behaviors: [bounceOnCorners],
    cells: [cell],
  });

  sut.step();

  vectorAxis((axis) => equal(cell.velocity[axis], 1, axis));
});

test('A cell outside of the window will have position adjusted to fit the screen', () => {
  const size = 200;
  const cell = createCell({ position: vector(size), radius: 5 });
  const sut = createTestLulas({
    behaviors: [bounceOnCorners],
    cells: [cell],
    worldSize: vector(size),
  });

  sut.step();

  vectorAxis((axis) => equal(cell.position[axis], 195, axis));
});

test('A cell outside of the window will have velocity adjusted to bounce on screen', () => {
  const size = 200;
  const cell = createCell({
    position: vector(size),
    velocity: vector(1),
  });
  const sut = createTestLulas({
    behaviors: [bounceOnCorners],
    cells: [cell],
    worldSize: vector(size),
  });

  sut.step();

  vectorAxis((axis) => equal(cell.velocity[axis], -1, axis));
});
