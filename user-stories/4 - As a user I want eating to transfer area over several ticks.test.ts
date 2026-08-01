import { equal, ok } from 'assert';

import { MAX_BITE_FRACTION } from '../src/CONFIGURATION';
import { energyOf } from '../src/entity';
import { bite } from '../src/life';
import { step } from '../src/step';
import { vector } from '../src/vector';
import { assertBetween } from '../test/assertions';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test('A bite moves area: what the prey loses, the eater gains', () => {
  const eater = entity('herbivore', vector(500, 500), 10);
  const prey = entity('plant', vector(500, 500), 3);

  const before = energyOf(eater) + energyOf(prey);
  bite(eater, prey);

  assertBetween(
    energyOf(eater) + energyOf(prey),
    before - 0.0001,
    before + 0.0001,
    'total area is conserved by a bite',
  );
});

test('A bite is capped at a fraction of the eater, so a big meal takes ticks', () => {
  const eater = entity('herbivore', vector(500, 500), 10);
  const prey = entity('plant', vector(500, 500), 100);

  const cap = energyOf(eater) * MAX_BITE_FRACTION;
  const taken = bite(eater, prey);

  assertBetween(taken, cap - 0.0001, cap + 0.0001, 'one bite is the cap');
  ok(prey.size > 90, 'the prey is still mostly there after one tick');
});

test('A bite never takes more than is left', () => {
  const eater = entity('herbivore', vector(500, 500), 50);
  const prey = entity('plant', vector(500, 500), 2);

  bite(eater, prey);

  equal(prey.size, 0);
});

test('A herbivore sitting on a plant drains it over several ticks and it disappears', () => {
  const herbivore = entity('herbivore', vector(500, 500), 8);
  const plant = entity('plant', vector(500, 500), 4);
  let entities = [herbivore, plant];

  const startingSize = herbivore.size;

  entities = step(entities, TEST_WORLD);
  ok(
    entities.some((e) => e.type === 'plant'),
    'one tick is not enough to finish the plant',
  );

  for (let i = 0; i < 40 && entities.some((e) => e.type === 'plant'); i++) {
    entities = step(entities, TEST_WORLD);
  }

  ok(
    !entities.some((e) => e.type === 'plant'),
    'the plant is eventually eaten to nothing and removed',
  );
  ok(herbivore.size > startingSize, 'the herbivore grew on what it ate');
});
