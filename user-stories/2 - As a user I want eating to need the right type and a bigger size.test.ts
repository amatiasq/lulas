import { equal, ok } from 'assert';

import { canEat, flees } from '../src/diet';
import {
  addEnergy,
  createEntity,
  energyOf,
  Entity,
  EntityType,
  setEnergy,
} from '../src/entity';
import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

const entity = (type: EntityType, size: number) =>
  createEntity(type, { size }) as Entity;

test(
  'Type decides whether it is on the menu at all',
  [
    // [eater, target, expected]
    ['herbivore', 'plant', true],
    ['herbivore', 'herbivore', false],
    ['herbivore', 'carnivore', false],
    ['carnivore', 'plant', false],
    ['carnivore', 'herbivore', true],
    ['carnivore', 'carnivore', true],
    ['plant', 'plant', false],
    ['plant', 'herbivore', false],
  ],
  (eater: EntityType, target: EntityType, expected: boolean) => {
    // The eater is the bigger one, so only type can be deciding this.
    equal(canEat(entity(eater, 10), entity(target, 5)), expected);
  },
);

test('Among cells, only a strictly bigger one eats', () => {
  ok(canEat(entity('carnivore', 10), entity('herbivore', 9)));
  ok(!canEat(entity('carnivore', 9), entity('herbivore', 10)));
});

test('Equal sizes never eat, in either direction', () => {
  const left = entity('carnivore', 10);
  const right = entity('carnivore', 10);

  ok(!canEat(left, right));
  ok(!canEat(right, left));
});

test('A herbivore eats a plant of any size', () => {
  ok(canEat(entity('herbivore', 1), entity('plant', 50)));
});

// The four cases a size-only threat check gets half right, silently.
test(
  'A cell flees exactly what could eat it',
  [
    // [cell, bigger other, expected to flee]
    ['herbivore', 'herbivore', false],
    ['herbivore', 'carnivore', true],
    ['carnivore', 'herbivore', false],
    ['carnivore', 'carnivore', true],
  ],
  (type: EntityType, threat: EntityType, expected: boolean) => {
    equal(flees(entity(type, 5), entity(threat, 10)), expected);
  },
);

test('Nothing flees something it is bigger than', () => {
  ok(!flees(entity('herbivore', 10), entity('carnivore', 5)));
  ok(!flees(entity('carnivore', 10), entity('carnivore', 5)));
});

test('Energy is area, and the size follows it back', () => {
  const cell = entity('herbivore', 10);
  equal(energyOf(cell), Math.PI * 100);

  setEnergy(cell, Math.PI * 25);
  equal(cell.size, 5);
});

test('Energy never goes negative — it clamps at zero', () => {
  const cell = entity('herbivore', 3);
  addEnergy(cell, -energyOf(cell) * 10);
  equal(cell.size, 0);
});
