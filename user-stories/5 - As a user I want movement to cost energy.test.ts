import { ok } from 'assert';

import { energyOf } from '../src/entity';
import { burnMovementEnergy } from '../src/life';
import { step } from '../src/step';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

test('A still cell burns nothing', () => {
  const cell = entity('herbivore', vector(500, 500), 10);
  const before = energyOf(cell);

  burnMovementEnergy(cell);

  ok(energyOf(cell) === before);
});

test('Going faster costs more than twice as much — the cost is quadratic', () => {
  const slow = entity('herbivore', vector(500, 500), 10);
  slow.velocity = vector(1, 0);

  const fast = entity('herbivore', vector(500, 500), 10);
  fast.velocity = vector(2, 0);

  const slowCost = burnMovementEnergy(slow);
  const fastCost = burnMovementEnergy(fast);

  ok(
    fastCost > slowCost * 2,
    `expected ${fastCost} to be more than twice ${slowCost}`,
  );
});

// The test the whole ecosystem hangs on: if this cannot fail, movement is free
// and nothing can ever starve.
test('With no plants, the herbivores starve to nothing', () => {
  let entities = [
    entity('herbivore', vector(100, 100), 6),
    entity('herbivore', vector(300, 700), 6),
  ];

  // Give them somewhere to be going, so they are burning area.
  entities.forEach((cell) => (cell.velocity = vector(2, 1)));

  for (let i = 0; i < 20000 && entities.length; i++) {
    entities = step(entities, TEST_WORLD);
  }

  ok(entities.length === 0, `expected an empty world, found ${entities.length}`);
});

test('A carnivore that never catches anything starves the same way', () => {
  let entities = [entity('carnivore', vector(500, 500), 8)];
  entities[0].velocity = vector(3, 0);

  for (let i = 0; i < 20000 && entities.length; i++) {
    entities = step(entities, TEST_WORLD);
  }

  ok(entities.length === 0);
});
