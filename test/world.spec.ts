import './matchers';

import { Cell } from '../src/Cell';
import { Vector } from '../src/Vector';
import { World } from '../src/World';

let world;

beforeEach(() => {
  world = new World(Vector.of(10, 10));
});

test('World returns no entities if empty', () => {
  const entities = world.getEntitiesIn(Vector.ZERO, 20);

  expect(entities).toHaveLength(0);
});

test('World returns single entity if in range', () => {
  const cell = new Cell();

  cell.pos = Vector.of(3, 3);
  world.add(cell);

  const entities = world.getEntitiesIn(Vector.ZERO, 5);

  expect(entities).toHaveLength(1);
  expect(entities[0]).toBe(cell);
});

test('World returns entity if entity is in border of radius', () => {
  const cell = new Cell();

  cell.pos = Vector.of(3, 0);
  cell.flushState();
  world.add(cell);

  const entities = world.getEntitiesIn(Vector.ZERO, 3);

  expect(entities).toHaveLength(1);
  expect(entities[0]).toBe(cell);
});

test('World returns no entity if entity is outside radius', () => {
  const cell = new Cell();

  cell.size = 0.1;
  cell.pos = Vector.of(3, 3);
  cell.flushState();
  world.add(cell);

  const entities = world.getEntitiesIn(Vector.ZERO, 3);

  expect(entities).toHaveLength(0);
});

test('World returns as many entities as visible', () => {
  const cells = [];

  for (let i = 0; i < 10; i++) {
    const cell = new Cell();
    cell.pos = Vector.of(i, i);
    cell.flushState();
    cells.push(cell);
    world.add(cell);
  }

  const entities = world.getEntitiesIn(Vector.ZERO, 2);

  expect(entities).toHaveLength(3);
  expect(entities[0]).toBe(cells[0]);
  expect(entities[1]).toBe(cells[1]);
  expect(entities[2]).toBe(cells[2]);
});

test.each([
  Vector.of(4, 5),
  Vector.of(5, 4),
  Vector.of(5, 5),
  Vector.of(6, 5),
  Vector.of(5, 6),
])('Returns the entity at a given position %s', vector => {
  const { cell, world } = makeEntitiesAtTest();
  const result = world.getEntitiesAt(vector);

  expect(result).toHaveLength(1);
  expect(result[0]).toBe(cell);
});

test.each([Vector.of(4, 4), Vector.of(4, 6), Vector.of(6, 4), Vector.of(6, 6)])(
  'Returns empty if no entity is at that position %s',
  vector => {
    const { world } = makeEntitiesAtTest();

    const result = world.getEntitiesAt(vector);

    expect(result).toHaveLength(0);
  },
);

function makeEntitiesAtTest() {
  const cell = new Cell();

  cell.size = 1.1;
  cell.pos = Vector.of(5, 5);
  cell.flushState();
  world.add(cell);

  return { cell, world };
}
