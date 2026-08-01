import { equal, ok } from 'assert';

import { resolveCollisions } from '../src/collision';
import { Entity } from '../src/entity';
import { step } from '../src/step';
import { magnitude, subtractVectors, vector } from '../src/vector';
import { assertBetween } from '../test/assertions';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const { worldSize } = TEST_WORLD;

const gap = (left: Entity, right: Entity) =>
  magnitude(subtractVectors(left.position, right.position));

test('Two overlapping cells are pushed apart until they only touch', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(504, 500), 5);

  resolveCollisions([left, right], worldSize);

  assertBetween(gap(left, right), 9.9999, 10.0001, 'exactly touching');
});

test('Each cell gives half the correction', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(504, 500), 5);

  resolveCollisions([left, right], worldSize);

  equal(left.position.x, 497);
  equal(right.position.x, 507);
});

test('Cells exactly on top of each other still separate', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(500, 500), 5);

  resolveCollisions([left, right], worldSize);

  assertBetween(gap(left, right), 9.9999, 10.0001);
});

test('Cells that are merely near each other are left alone', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(520, 500), 5);

  resolveCollisions([left, right], worldSize);

  equal(left.position.x, 500);
  equal(right.position.x, 520);
});

test('A head-on bump stops both cells instead of grinding through', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(504, 500), 5);
  left.velocity = vector(2, 0);
  right.velocity = vector(-2, 0);

  resolveCollisions([left, right], worldSize);

  ok(left.velocity.x <= 0, `expected it to stop, got ${left.velocity.x}`);
  ok(right.velocity.x >= 0, `expected it to stop, got ${right.velocity.x}`);
});

// The reason collisions damp the normal only. Swapping the whole velocity made a
// graze as expensive as a head-on hit, and in a herd cells touch constantly: it
// held the average speed ~30% under the limit and just felt sluggish.
test('A cell brushing past another keeps the speed it was not aiming at it', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(504, 500), 5);
  // Moving sideways, barely into each other: nothing along the line between them.
  left.velocity = vector(0, 3);
  right.velocity = vector(0, 3);

  resolveCollisions([left, right], worldSize);

  equal(left.velocity.y, 3, 'the sideways speed survives the graze');
  equal(right.velocity.y, 3);
});

test('Cells already moving apart are left alone', () => {
  const left = entity('herbivore', vector(500, 500), 5);
  const right = entity('herbivore', vector(504, 500), 5);
  left.velocity = vector(-2, 0);
  right.velocity = vector(2, 0);

  resolveCollisions([left, right], worldSize);

  // Still pushed out of each other, but their speed is not touched — otherwise
  // an overlap being resolved keeps re-braking them and they jitter.
  equal(left.velocity.x, -2);
  equal(right.velocity.x, 2);
});

test('Collision separates across the map edge, not back through the middle', () => {
  const left = entity('herbivore', vector(999, 500), 5);
  const right = entity('herbivore', vector(3, 500), 5);

  resolveCollisions([left, right], worldSize);

  // 999 and 3 are 4 apart across the wrap: left goes left, right goes right,
  // and both stay inside the map.
  equal(left.position.x, 996);
  equal(right.position.x, 6);
});

// Eating needs the two touching, so a solid predator could never take a second
// bite — it would shove its meal away the moment it caught it.
test('A predator does NOT push away prey it can eat', () => {
  const carnivore = entity('carnivore', vector(500, 500), 10);
  const herbivore = entity('herbivore', vector(504, 500), 4);

  resolveCollisions([carnivore, herbivore], worldSize);

  equal(carnivore.position.x, 500);
  equal(herbivore.position.x, 504);
});

test('A carnivore too small to eat a herbivore bumps into it instead', () => {
  const carnivore = entity('carnivore', vector(500, 500), 4);
  const herbivore = entity('herbivore', vector(504, 500), 10);

  resolveCollisions([carnivore, herbivore], worldSize);

  ok(gap(carnivore, herbivore) > 4, 'they were pushed apart');
});

test('Plants are not solid — a herbivore has to sit on one to eat it', () => {
  const herbivore = entity('herbivore', vector(500, 500), 8);
  const plant = entity('plant', vector(502, 500), 3);

  resolveCollisions([herbivore, plant], worldSize);

  equal(herbivore.position.x, 500);
  equal(plant.position.x, 502);
});

test('A step leaves no two cells overlapping', () => {
  // Same spot, same size: nothing can eat anything, so they must spread out.
  let entities: Entity[] = [
    entity('herbivore', vector(500, 500), 6),
    entity('herbivore', vector(500, 500), 6),
    entity('herbivore', vector(502, 501), 6),
  ];

  entities = step(entities, TEST_WORLD);

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const minDistance = entities[i].size + entities[j].size;
      ok(
        gap(entities[i], entities[j]) > minDistance * 0.7,
        `still overlapping: ${gap(entities[i], entities[j])} < ${minDistance}`,
      );
    }
  }
});
