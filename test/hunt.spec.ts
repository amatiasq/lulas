import './matchers';

import { Cell } from '../src/Cell';
import { Stat } from '../src/Stat';
import { Vector } from '../src/Vector';
import { World } from '../src/World';

const WORLD_SIZE = Vector.of(10, 10);
const WORLD_CENTER = Vector.of(5, 5);

for (const vector of Vector.iterate(WORLD_SIZE)) {
  test(`Hunter sees prey at ${vector}`, () => {
    const { hunter, prey } = makeWorld(WORLD_CENTER, vector);

    hunter.setStat(Stat.VISION_RANGE, 20);
    hunter.flushState();
    prey.flushState();

    expect(hunter.canSee(prey)).toBeTrue();
  });

  if (!vector.is(WORLD_CENTER)) {
    test(`Hunter doesn't see prey out of range at ${vector}`, () => {
      const { hunter, prey } = makeWorld(WORLD_CENTER, vector);

      prey.size = 0.3;
      hunter.setStat(Stat.VISION_RANGE, 0.1);
      hunter.flushState();
      prey.flushState();

      expect(hunter.canSee(prey)).toBeFalse();
    });
  }

  test(`Hunter moves torwards prey at ${vector}`, () => {
    const { hunter, prey, world } = makeWorld(WORLD_CENTER, vector);
    const direction = prey.pos.sub(hunter.pos);

    hunter.setStat(Stat.FRICTION, 0);
    hunter.setStat(Stat.MAX_RADIUS, 100);
    hunter.setStat(Stat.VISION_RANGE, 20);
    hunter.setStat(Stat.HUNT_ACCELERATION, 1);
    hunter.flushState();
    prey.flushState();

    hunter.tick(world);

    const { x, y } = hunter.velocity;

    if (direction.x) {
      expect(x).toBeBetween(0, direction.x);
    }

    if (direction.y) {
      expect(y).toBeBetween(0, direction.y);
    }
  });
}

test('Hunter eats prey on contact', () => {
  const { hunter, prey, world } = makeWorld({ x: 5, y: 5 }, { x: 5, y: 5 });
  const spy = jest.fn();

  hunter.on('eat', spy);
  hunter.setStat(Stat.FRICTION, 0);
  hunter.setStat(Stat.MAX_RADIUS, 100);
  hunter.setStat(Stat.VISION_RANGE, 10);
  hunter.flushState();
  prey.flushState();

  expect(hunter.isTouching(prey)).toBeTrue();

  hunter.tick(world);

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(prey);
});

test("Hunter doesn't move if prey is out of range", () => {
  const { hunter, world } = makeWorld({ x: 2, y: 2 }, { x: 8, y: 8 });

  hunter.setStat(Stat.FRICTION, 0);
  hunter.setStat(Stat.MAX_RADIUS, 100);
  hunter.setStat(Stat.VISION_RANGE, 1);
  hunter.flushState();

  hunter.tick(world);

  expect(hunter.velocity.isZero).toBeTrue();
});

test("Hunter doesn't eat prey even if close by", () => {
  const { hunter, prey, world } = makeWorld({ x: 2, y: 2 }, { x: 3, y: 3 });
  const spy = jest.fn();

  hunter.on('eat', spy);
  hunter.setStat(Stat.FRICTION, 0);
  hunter.setStat(Stat.MAX_RADIUS, 100);
  hunter.setStat(Stat.VISION_RANGE, 1);
  hunter.setStat(Stat.HUNT_ACCELERATION, 1);
  hunter.flushState();
  prey.flushState();

  expect(hunter.isTouching(prey)).toBeFalse();

  hunter.tick(world);

  expect(spy).not.toHaveBeenCalled();
});

function makeWorld({ x: hunterX, y: hunterY }, { x: preyX, y: preyY }) {
  const world = new World(WORLD_SIZE);
  const hunter = new Cell();
  const prey = new Cell();

  hunter.velocity = Vector.of(0, 0);
  hunter.pos = Vector.of(hunterX, hunterY);
  hunter.size = 0.5;

  prey.pos = Vector.of(preyX, preyY);
  prey.size = 0.4;

  hunter.setDietType(Cell);
  world.add(hunter);
  world.add(prey);

  return { hunter, prey, world };
}
