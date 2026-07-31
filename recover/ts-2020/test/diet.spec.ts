import './matchers';

import { Cell } from '../src/Cell';
import { Stat } from '../src/Stat';

class Dummy {
  energy = 1;
}

test('A cell should accept a list of valid diet', () => {
  const sut = new Cell();
  const target = new Dummy();

  expect(sut.canEat(target)).toBe(false);

  sut.setDietType(Dummy, 1);

  expect(sut.canEat(target)).toBe(true);
});

test('A cell should estimate how nutricious a given food is', () => {
  const sut = new Cell();
  const target = new Dummy();

  sut.setDietType(Dummy, 0.5);

  expect(sut.considerFood(target)).toBe(0.5);
});

test('A cell should take in account how much of a threat a food target is', () => {
  const sut = new Cell();
  const target = new Cell();
  const SIZE_DIFF = 1;
  const FOOD_VALUE = 0.5;

  sut.size = 1;
  target.size = 1 + SIZE_DIFF;

  sut.setDietType(Cell, FOOD_VALUE);
  sut.flushState();
  target.flushState();

  expect(sut.considerFood(target)).toBe(FOOD_VALUE - SIZE_DIFF);
});

test('A cell should eat a valid target', () => {
  const sut = new Cell();
  const target = new Dummy();

  sut.setDietType(Dummy, 1);

  expect(sut.eat(target)).toBeTrue();
});

test('A cell should throw when try to eat a invalid target', () => {
  const sut = new Cell();
  const target = new Dummy();

  expect(() => sut.eat(target)).toThrow();
});

test("A cell should grow it's maximum bite size when eating", () => {
  const SUT_ENERGY = 10;
  const TARGET_ENERGY = 10;
  const BITE_SIZE = 0.1;
  const sut = new Cell();
  const target = new Dummy();

  sut.energy = SUT_ENERGY;
  target.energy = TARGET_ENERGY;

  sut.setStat(Stat.MAX_BITE_SIZE, BITE_SIZE);
  sut.setDietType(Dummy, 1);

  sut.flushState();
  sut.eat(target);
  sut.flushState();

  expect(sut.energy).toBeAprox(SUT_ENERGY + SUT_ENERGY * BITE_SIZE);
});

test("A cell should absorb it's food if it's smaller than it's bite size", () => {
  const SUT_ENERGY = 10;
  const TARGET_ENERGY = 3;
  const BITE_SIZE = 0.5;
  const sut = new Cell();
  const target = new Dummy();

  sut.energy = SUT_ENERGY;
  target.energy = TARGET_ENERGY;

  sut.setStat(Stat.MAX_BITE_SIZE, BITE_SIZE);
  sut.setDietType(Dummy, 1);

  sut.flushState();
  sut.eat(target);
  sut.flushState();

  expect(sut.energy).toBeAprox(SUT_ENERGY + TARGET_ENERGY);
});

test('A cell should grow proportionally to how nutritive the food is', () => {
  const SUT_ENERGY = 10;
  const TARGET_ENERGY = 3;
  const NITRITIOUS_VALUE = 0.5;
  const sut = new Cell();
  const target = new Dummy();

  sut.energy = SUT_ENERGY;
  target.energy = TARGET_ENERGY;

  sut.setStat(Stat.MAX_BITE_SIZE, 1);
  sut.setDietType(Dummy, NITRITIOUS_VALUE);

  sut.flushState();
  sut.eat(target);
  sut.flushState();

  expect(sut.energy).toBeAprox(SUT_ENERGY + TARGET_ENERGY * NITRITIOUS_VALUE);
});

test('The food source should shink proportionally to the eater bit size', () => {
  const SUT_ENERGY = 4;
  const TARGET_ENERGY = 3;
  const BITE_SIZE = 0.25;
  const sut = new Cell();
  const target = new Dummy();

  sut.energy = SUT_ENERGY;
  target.energy = TARGET_ENERGY;

  sut.setStat(Stat.MAX_BITE_SIZE, BITE_SIZE);
  sut.setDietType(Dummy, 1);

  sut.flushState();
  sut.eat(target);
  sut.flushState();

  expect(target.energy).toBeAprox(TARGET_ENERGY - SUT_ENERGY * BITE_SIZE);
});

test('A cell should avoid trying to eat a bigger cell', () => {
  const sut = new Cell();
  const target = new Cell();

  sut.energy = 3;
  target.energy = 3.1;

  sut.setStat(Stat.MAX_BITE_SIZE, 10);
  sut.setDietType(Cell, 1);

  expect(sut.canEat(target)).toBeFalse();
});
