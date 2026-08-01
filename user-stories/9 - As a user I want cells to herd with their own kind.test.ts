import { equal, ok } from 'assert';

import { decide } from '../src/behavior';
import { flock } from '../src/flock';
import { isZero, magnitude, vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const { worldSize } = TEST_WORLD;
const HERE = vector(500, 500);

test('A cell on its own has nobody to herd with', () => {
  ok(isZero(flock(entity('herbivore', HERE, 5), [], worldSize)));
});

test('Only its own kind counts as a neighbour', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const carnivore = entity('carnivore', vector(560, 500), 4);

  ok(
    isZero(flock(herbivore, [carnivore], worldSize)),
    'a herbivore must never steer itself by a carnivore',
  );
});

test('Cohesion pulls a lone cell toward the group', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const herd = [
    entity('herbivore', vector(580, 500), 5),
    entity('herbivore', vector(575, 520), 5),
    entity('herbivore', vector(585, 480), 5),
  ];

  const force = flock(herbivore, herd, worldSize);

  ok(force.x > 0, `expected a pull to the right, got ${force.x}`);
});

test('Separation pushes it back out when the group is on top of it', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const crowd = [
    entity('herbivore', vector(506, 500), 5),
    entity('herbivore', vector(508, 502), 5),
    entity('herbivore', vector(507, 498), 5),
  ];

  const force = flock(herbivore, crowd, worldSize);

  ok(force.x < 0, `expected a push to the left, got ${force.x}`);
});

test('Alignment turns a cell toward the heading of its neighbours', () => {
  const herbivore = entity('herbivore', HERE, 5);
  herbivore.velocity = vector(0, 0);

  // Directly above and below, so cohesion cancels on x and only alignment is
  // left to explain a sideways force.
  const herd = [
    entity('herbivore', vector(500, 440), 5),
    entity('herbivore', vector(500, 560), 5),
  ];
  herd.forEach((cell) => (cell.velocity = vector(3, 0)));

  const force = flock(herbivore, herd, worldSize);

  ok(force.x > 0, `expected it to pick up their heading, got ${force.x}`);
});

test('Herding works across the map edge', () => {
  const herbivore = entity('herbivore', vector(990, 500), 5);
  const herd = [
    entity('herbivore', vector(60, 500), 5),
    entity('herbivore', vector(55, 520), 5),
  ];

  const force = flock(herbivore, herd, worldSize);

  ok(force.x > 0, 'it heads across the edge, not back through the map');
});

// The invariants flocking must not break.
test('A threat still outranks the herd', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const herd = [
    entity('herbivore', vector(580, 500), 5),
    entity('herbivore', vector(575, 520), 5),
  ];
  const carnivore = entity('carnivore', vector(560, 500), 12);

  equal(decide(herbivore, [...herd, carnivore], worldSize).action, 'flee');
});

test('Food still outranks the herd', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const herd = [entity('herbivore', vector(580, 500), 5)];
  const plant = entity('plant', vector(560, 500), 3);

  equal(decide(herbivore, [...herd, plant], worldSize).action, 'hunt');
});

test('Herding is gentler than hunting — it never looks urgent', () => {
  const herbivore = entity('herbivore', HERE, 5);
  const herd = [entity('herbivore', vector(590, 560), 5)];
  const plant = entity('plant', vector(590, 560), 3);

  const herding = decide(herbivore, herd, worldSize);
  const hunting = decide(herbivore, [plant], worldSize);

  ok(herding.action === 'flock' && hunting.action === 'hunt');
  ok(magnitude(herding.force) < magnitude(hunting.force));
});
