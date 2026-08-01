import { equal, ok } from 'assert';

import {
  CARNIVORES_PER_SCREEN,
  MIN_WORLD_SCREENFULS,
  HERBIVORES_PER_SCREEN,
  PLANTS_PER_SCREEN,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
} from '../src/CONFIGURATION';
import { EntityType } from '../src/entity';
import {
  plantLimit,
  populate,
  screenfuls,
  seedInterval,
  viableWorld,
} from '../src/simulation';
import { vector } from '../src/vector';
import { assertBetween } from '../test/assertions';
import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

const REFERENCE = vector(REFERENCE_WIDTH, REFERENCE_HEIGHT);
const PHONE = vector(390, 700);
const HUGE = vector(7680, 4320);

const count = (worldSize = REFERENCE) => {
  const world = populate(worldSize);
  const of = (type: EntityType) => world.filter((e) => e.type === type).length;

  return { plants: of('plant'), herbivores: of('herbivore'), carnivores: of('carnivore') };
};

test('The reference screen gets exactly the tuned numbers', () => {
  equal(screenfuls(REFERENCE), 1);

  const world = count();
  equal(world.plants, PLANTS_PER_SCREEN);
  equal(world.herbivores, HERBIVORES_PER_SCREEN);
  equal(world.carnivores, CARNIVORES_PER_SCREEN);
});

test('A bigger screen gets proportionally more, not the same handful', () => {
  const factor = screenfuls(HUGE);
  ok(factor > 20, `an 8K screen is ${factor.toFixed(1)} reference screens`);

  const world = count(HUGE);

  assertBetween(
    world.herbivores / HERBIVORES_PER_SCREEN,
    factor - 1,
    factor + 1,
    'herbivores scale with the area',
  );
  assertBetween(world.plants / PLANTS_PER_SCREEN, factor - 1, factor + 1);
});

test('Density is what is preserved, so cells meet each other just as often', () => {
  const perPixel = (worldSize: typeof REFERENCE) =>
    count(worldSize).herbivores / (worldSize.x * worldSize.y);

  const reference = perPixel(REFERENCE);

  for (const screen of [PHONE, HUGE, vector(2560, 1440)]) {
    assertBetween(
      perPixel(screen) / reference,
      0.9,
      1.15,
      `density on ${screen.x}x${screen.y}`,
    );
  }
});

test('A phone still gets a whole ecosystem, never zero of something', () => {
  const world = count(PHONE);

  ok(world.plants > 0, 'plants');
  ok(world.herbivores > 0, 'herbivores');
  // 4 carnivores per screen on a fifth of a screen rounds to one, not to none —
  // a world that starts with no carnivores is a different simulation.
  ok(world.carnivores > 0, 'carnivores');
});

test('The plant cap scales too, or a big world stays bare', () => {
  ok(plantLimit(HUGE) > plantLimit(REFERENCE) * 20);
  ok(plantLimit(PHONE) < plantLimit(REFERENCE));
  ok(plantLimit(PHONE) >= 1);
});

test('Seedlings arrive more often in a bigger world, to hold the same density', () => {
  ok(
    seedInterval(HUGE) < seedInterval(REFERENCE),
    'more area, more often',
  );
  ok(seedInterval(HUGE) >= 1, 'never zero, that would be every tick and then some');
  ok(seedInterval(PHONE) > seedInterval(REFERENCE));
});

// A world can be smaller than a screen full of cells can survive. Measured over
// 25k ticks: a phone-sized world lost everything in 2 runs out of 3, and 0.42
// screenfuls survived 3 out of 3. So a small canvas gets a bigger world, drawn
// scaled down, instead of a fifth of an ecosystem.
test('A canvas big enough is the world, untouched', () => {
  const world = viableWorld(REFERENCE);

  equal(world.x, REFERENCE.x);
  equal(world.y, REFERENCE.y);
});

test('A canvas too small to hold a living ecosystem gets a bigger world', () => {
  const world = viableWorld(PHONE);

  ok(world.x > PHONE.x, 'the world is wider than the screen');
  assertBetween(
    screenfuls(world),
    MIN_WORLD_SCREENFULS - 0.001,
    MIN_WORLD_SCREENFULS + 0.001,
  );
});

test('Growing the world keeps its shape, so nothing is drawn squashed', () => {
  const world = viableWorld(PHONE);

  assertBetween(
    world.x / world.y,
    PHONE.x / PHONE.y - 0.001,
    PHONE.x / PHONE.y + 0.001,
    'same aspect ratio',
  );
  // Which is what lets the drawing scale by a single number.
  assertBetween(world.x / PHONE.x, world.y / PHONE.y - 0.001, world.y / PHONE.y + 0.001);
});

test('A phone ends up with a population that can actually survive', () => {
  const world = viableWorld(PHONE);
  const herbivores = populate(world).filter((e) => e.type === 'herbivore').length;

  ok(
    herbivores >= HERBIVORES_PER_SCREEN * MIN_WORLD_SCREENFULS,
    `${herbivores} herbivores is above the measured survival floor`,
  );
});
