import { equal, ok } from 'assert';

import { simulation } from '../src/simulation';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

function createTestSimulation() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;

  return simulation({ canvas, worldSize: vector(600, 400) });
}

test('It starts with plants, herbivores and carnivores in the world', () => {
  const game = createTestSimulation();
  const types = new Set(game.entities.map((entity) => entity.type));

  ok(types.has('plant'));
  ok(types.has('herbivore'));
  ok(types.has('carnivore'));
});

test('Everything starts inside the map', () => {
  const game = createTestSimulation();

  for (const { position } of game.entities) {
    ok(position.x >= 0 && position.x <= 600, `x out of the map: ${position.x}`);
    ok(position.y >= 0 && position.y <= 400, `y out of the map: ${position.y}`);
  }
});

test('It runs for a while without anything leaving the map or going negative', () => {
  const game = createTestSimulation();

  for (let i = 0; i < 500; i++) {
    game.step();

    for (const entity of game.entities) {
      ok(entity.size > 0, 'no cell has zero or negative size');
      ok(
        entity.position.x >= 0 && entity.position.x <= 600,
        `x out of the map: ${entity.position.x}`,
      );
      ok(
        entity.position.y >= 0 && entity.position.y <= 400,
        `y out of the map: ${entity.position.y}`,
      );
    }
  }

  ok(game.entities.length > 0, 'the world did not empty out immediately');
});

test('It renders without blowing up', () => {
  const game = createTestSimulation();

  game.step();
  game.render();

  equal(typeof game.entities.length, 'number');
});
