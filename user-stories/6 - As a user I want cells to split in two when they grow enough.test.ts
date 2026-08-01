import { equal, ok } from 'assert';

import { energyOf, Entity, mitosisSizeOf } from '../src/entity';
import { canSplit, split } from '../src/life';
import { step } from '../src/step';
import { vector } from '../src/vector';
import { assertBetween } from '../test/assertions';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const herbivoreMitosisSize = mitosisSizeOf(
  entity('herbivore', vector(0, 0)),
);
const BIG = herbivoreMitosisSize + 1;

test('A cell splits only once it passes the threshold', () => {
  ok(!canSplit(entity('herbivore', vector(500, 500), herbivoreMitosisSize)));
  ok(canSplit(entity('herbivore', vector(500, 500), BIG)));
});

test('Mitosis makes exactly two children, each at half the radius', () => {
  const parent = entity('herbivore', vector(500, 500), BIG);
  const children = split(parent, TEST_WORLD.size);

  equal(children.length, 2);
  children.forEach((child) => equal(child.size, parent.size / 2));
});

test('The two children together hold half the area — the loss is the point', () => {
  const parent = entity('herbivore', vector(500, 500), BIG);
  const children = split(parent, TEST_WORLD.size);
  const total = children.reduce((sum, child) => sum + energyOf(child), 0);

  assertBetween(
    total,
    energyOf(parent) / 2 - 0.0001,
    energyOf(parent) / 2 + 0.0001,
  );
});

test('The children leave in opposite directions', () => {
  const [left, right] = split(entity('herbivore', vector(500, 500), BIG), TEST_WORLD.size);

  assertBetween(left.velocity.x + right.velocity.x, -0.0001, 0.0001);
  assertBetween(left.velocity.y + right.velocity.y, -0.0001, 0.0001);
  ok(
    left.velocity.x !== 0 || left.velocity.y !== 0,
    'they are actually shoved apart',
  );
});

test('Children keep the parent type', () => {
  split(entity('carnivore', vector(500, 500), BIG), TEST_WORLD.size).forEach((child) =>
    equal(child.type, 'carnivore'),
  );
});

test('A step replaces the splitting cell with its two children', () => {
  const parent = entity('herbivore', vector(500, 500), BIG);
  const next = step([parent], TEST_WORLD);

  equal(next.length, 2);
  ok(!next.includes(parent));
});

test('Two children of the same split cannot eat each other — they are the same size', () => {
  let entities: Entity[] = split(entity('carnivore', vector(500, 500), BIG), TEST_WORLD.size);

  // They are born touching; if equal sizes could eat, one would vanish here.
  entities = step(entities, TEST_WORLD);

  equal(entities.length, 2);
});
