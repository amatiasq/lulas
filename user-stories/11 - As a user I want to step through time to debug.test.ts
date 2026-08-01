import { equal, ok } from 'assert';

import { Entity } from '../src/entity';
import { step } from '../src/step';
import { timeline } from '../src/timeline';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const advance = (entities: Entity[]) => step(entities, TEST_WORLD);

function moving() {
  const cell = entity('herbivore', vector(500, 500), 6);
  cell.velocity = vector(2, 0);
  return [cell];
}

test('It starts at the present, with one frame', () => {
  const time = timeline(moving(), advance);

  equal(time.length, 1);
  equal(time.behind, 0);
});

test('Going back returns the world as it was', () => {
  const time = timeline(moving(), advance);
  const startX = time.current[0].position.x;

  time.forward();
  time.forward();
  const movedX = time.current[0].position.x;
  ok(movedX > startX, 'it actually moved');

  time.back();
  time.back();

  equal(time.current[0].position.x, startX);
  equal(time.behind, 2);
});

test('The past is not the present in disguise', () => {
  // The bug this guards: `step` mutates the entities it is handed and returns
  // the same objects, so a frame stored by reference would move with the world.
  const time = timeline(moving(), advance);
  const past = time.current;
  const pastX = past[0].position.x;

  time.forward();
  time.forward();

  equal(past[0].position.x, pastX, 'the stored frame did not move');
});

test('Forward after going back replays, it does not re-roll the world', () => {
  const time = timeline(moving(), advance);

  time.forward();
  time.forward();
  const present = time.current.map((e) => `${e.id}:${e.position.x}`).join();

  time.back();
  time.back();
  time.forward();
  time.forward();

  equal(time.current.map((e) => `${e.id}:${e.position.x}`).join(), present);
  equal(time.behind, 0);
});

test('It cannot walk back past the beginning', () => {
  const time = timeline(moving(), advance);
  const startX = time.current[0].position.x;

  time.forward();
  for (let i = 0; i < 10; i++) time.back();

  equal(time.current[0].position.x, startX);
});

test('Old frames are dropped, so it does not grow forever', () => {
  const time = timeline(moving(), advance, 5);

  for (let i = 0; i < 20; i++) time.forward();

  equal(time.length, 5);
});

test('Stepping forward from the present computes new frames', () => {
  const time = timeline(moving(), advance);

  time.forward();
  time.forward();
  time.back();
  const before = time.length;

  time.forward();
  equal(time.length, before, 'that one was a replay');

  time.forward();
  equal(time.length, before + 1, 'this one is new');
});
