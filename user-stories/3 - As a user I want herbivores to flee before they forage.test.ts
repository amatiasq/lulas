import { equal, ok } from 'assert';

import { decide } from '../src/behavior';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const { size } = TEST_WORLD;
const HERE = vector(500, 500);

test('A herbivore with only a plant in sight goes for it', () => {
  const herbivore = entity('herbivore', HERE);
  const plant = entity('plant', vector(560, 500));

  const intent = decide(herbivore, [plant], size);

  equal(intent.action, 'hunt');
  ok(intent.action === 'hunt' && intent.force.x > 0);
});

test('A herbivore with a plant AND a carnivore in sight runs', () => {
  const herbivore = entity('herbivore', HERE, 5);
  // The plant is closer than the threat: proximity must not outrank survival.
  const plant = entity('plant', vector(510, 500));
  const carnivore = entity('carnivore', vector(440, 500), 10);

  const intent = decide(herbivore, [plant, carnivore], size);

  equal(intent.action, 'flee');
});

test('Fleeing points AWAY from the threat, not at it', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const carnivore = entity('carnivore', vector(560, 500), 10);

  const intent = decide(herbivore, [carnivore], size);

  ok(intent.action === 'flee');
  ok(intent.force.x < 0, `expected to accelerate left, got ${intent.force.x}`);
});

test('Fleeing goes across the map edge when that is the way out', () => {
  // Threat just inside the left edge, prey just inside the right edge: the
  // short way between them is across the wrap, so the escape is to the LEFT
  // (deeper into the map), not right into the threat.
  const herbivore = entity('herbivore', vector(995, 500), 5);
  const carnivore = entity('carnivore', vector(5, 500), 10);

  const intent = decide(herbivore, [carnivore], size);

  ok(intent.action === 'flee');
  ok(intent.force.x < 0, `expected to accelerate left, got ${intent.force.x}`);
});

test('A herbivore ignores a bigger herbivore and keeps eating', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const plant = entity('plant', vector(560, 500));
  const bully = entity('herbivore', vector(520, 500), 20);

  equal(decide(herbivore, [plant, bully], size).action, 'hunt');
});

test('A carnivore goes for the nearest herbivore', () => {
  const carnivore = entity('carnivore', HERE, 10);
  const near = entity('herbivore', vector(540, 500), 4);
  const far = entity('herbivore', vector(400, 500), 4);

  const intent = decide(carnivore, [far, near], size);

  ok(intent.action === 'hunt');
  equal(intent.target.id, near.id);
});

test('A carnivore only goes for another carnivore when no herbivore is in sight', () => {
  const carnivore = entity('carnivore', HERE, 10);
  const smaller = entity('carnivore', vector(560, 500), 4);
  const herbivore = entity('herbivore', vector(400, 500), 4);

  const withHerbivore = decide(carnivore, [smaller, herbivore], size);
  ok(withHerbivore.action === 'hunt');
  equal(withHerbivore.target.id, herbivore.id);

  const alone = decide(carnivore, [smaller], size);
  ok(alone.action === 'hunt');
  equal(alone.target.id, smaller.id);
});

test('A carnivore never chases a carnivore it cannot eat', () => {
  const carnivore = entity('carnivore', HERE, 10);
  const equalSized = entity('carnivore', vector(560, 500), 10);

  // It may still herd with it — what it must not do is treat it as prey.
  const intent = decide(carnivore, [equalSized], size);

  ok(intent.action !== 'hunt' && intent.action !== 'eat', intent.action);
});

test('Touching prey is eaten, not chased', () => {
  const carnivore = entity('carnivore', HERE, 10);
  const herbivore = entity('herbivore', vector(505, 500), 4);

  const intent = decide(carnivore, [herbivore], size);

  equal(intent.action, 'eat');
});
