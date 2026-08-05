import { equal, ok } from 'assert';

import { controls } from '../src/controls';
import {
  countByType,
  debugRows,
  fpsMeter,
  renderDebugPanel,
  renderQuadrants,
  rollingAverage,
  totalEnergy,
} from '../src/debug';
import { energyOf } from '../src/entity';
import { simulation } from '../src/simulation';
import { indexEntities } from '../src/spatial';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity } from '../test/test-duplicates';

setFilename(__dirname, __filename);

function fakeGame() {
  return { steps: 0, backs: 0, behind: 0, step() { this.steps++; }, back() { this.backs++; } };
}

function createTestSimulation() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;

  return simulation({ canvas, worldSize: vector(600, 400) });
}

test('D shows the panel, and D again hides it', () => {
  const time = controls(fakeGame());

  ok(!time.isDebug, 'the panel is off until it is asked for');

  ok(time.press('KeyD'), 'the page must not also act on the key');
  ok(time.isDebug);

  time.press('KeyD');
  ok(!time.isDebug);
});

test('Toggling the panel does not touch the simulation', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('KeyD');
  time.frame();

  equal(game.steps, 1, 'still running');
  ok(!time.isPaused);
});

test('The counts are per type, and they add up', () => {
  const entities = [
    entity('plant', vector(1, 1)),
    entity('plant', vector(2, 2)),
    entity('herbivore', vector(3, 3)),
    entity('carnivore', vector(4, 4)),
    entity('carnivore', vector(5, 5)),
    entity('carnivore', vector(6, 6)),
  ];

  const { plants, herbivores, carnivores } = countByType(entities);

  equal(plants, 2);
  equal(herbivores, 1);
  equal(carnivores, 3);
  equal(plants + herbivores + carnivores, entities.length);
});

// Invariant 8: one source, two sinks. The panel exists to make that budget
// readable, so the number it shows has to be the area of everything alive —
// area, not radius, or a world of seedlings would read the same as a world of
// full-grown plants.
test('The energy is the total area, not the total radius', () => {
  const entities = [entity('plant', vector(1, 1), 3), entity('herbivore', vector(2, 2), 4)];

  equal(totalEnergy(entities), energyOf(entities[0]) + energyOf(entities[1]));
  equal(totalEnergy([]), 0);
});

test('The frame rate comes off the gaps between frames', () => {
  const fps = fpsMeter();

  equal(fps.fps, 0, 'one timestamp is a gap from nothing');

  // 60 fps is a frame every 16.667 ms.
  for (let i = 0; i <= 10; i++) fps.sample(i * (1000 / 60));

  ok(Math.abs(fps.fps - 60) < 0.5, `expected ~60, got ${fps.fps}`);
});

test('The average forgets samples older than its window', () => {
  const average = rollingAverage(3);

  equal(average.value, 0, 'nothing measured yet');

  average.add(100);
  average.add(1);
  average.add(1);
  average.add(1);

  equal(average.value, 1, 'the 100 fell out of the window');
});

test('The panel shows what is going on', () => {
  const game = createTestSimulation();
  const rows = new Map(debugRows(game.debug(60)).map(([label, value]) => [label, value]));

  equal(rows.get('fps'), '60');

  const counts = countByType(game.entities);
  equal(rows.get('· plants'), String(counts.plants));
  equal(rows.get('· herbivores'), String(counts.herbivores));
  equal(rows.get('· carnivores'), String(counts.carnivores));
  equal(rows.get('cells'), String(game.entities.length));

  ok(rows.get('energy')!.endsWith('px²'), rows.get('energy'));
  ok(rows.get('tick')!.endsWith('ms'), rows.get('tick'));
});

test('It measures how long a tick takes, once one has been taken', () => {
  const game = createTestSimulation();

  equal(game.debug(60).msPerTick, 0, 'nothing has been stepped yet');

  game.step();
  ok(game.debug(60).msPerTick > 0, 'a tick is not free');
});

// The whole point of a quadtree is where it decided to split, and that is
// invisible from the outside: the answers are the same with or without it. So
// the overlay draws the tree's own boxes.
test('The index hands out the boxes it split itself into', () => {
  const worldSize = vector(1000, 1000);

  equal(indexEntities([], worldSize).quadrants().length, 0, 'no world, no tree');

  const alone = indexEntities([entity('plant', vector(500, 500))], worldSize);
  equal(alone.quadrants().length, 1, 'one entity never splits anything');

  // A crowd in one corner: the tree has to divide to hold it.
  const crowd = Array.from({ length: 40 }, (_, i) =>
    entity('plant', vector(10 + (i % 8), 10 + Math.floor(i / 8))),
  );

  const index = indexEntities(crowd, worldSize);
  ok(index.quadrants().length > 1, 'a crowd splits the tree');

  const [root] = index.quadrants();

  for (const box of index.quadrants()) {
    ok(
      box.left >= root.left &&
        box.top >= root.top &&
        box.right <= root.right &&
        box.bottom <= root.bottom,
      `a quadrant outside the root: ${box}`,
    );
  }
});

// The grid used to crawl: the root was the bounding box of the entities, so one
// cell drifting towards an edge moved every line on the screen, and a cell could
// change quadrant because something else moved.
test('The grid stands still while the cells move', () => {
  const worldSize = vector(1000, 1000);
  const box = (position: ReturnType<typeof vector>) =>
    String(indexEntities([entity('plant', position)], worldSize).quadrants()[0]);

  equal(box(vector(100, 100)), box(vector(900, 900)));
  equal(box(vector(100, 100)), box(vector(500, 500)));
});

test('The grid is drawn thin whatever the world is scaled to', () => {
  const widths: number[] = [];
  const rects: string[] = [];
  const context = {
    save() {},
    restore() {},
    set strokeStyle(value: string) {},
    set lineWidth(value: number) {
      widths.push(value);
    },
    strokeRect: (...args: number[]) => rects.push(args.join(',')),
  } as unknown as CanvasRenderingContext2D;

  const boxes = indexEntities(
    Array.from({ length: 40 }, (_, i) => entity('plant', vector(10 + (i % 8), 10))),
    vector(1000, 1000),
  ).quadrants();

  // A world drawn at half size needs lines twice as wide in world units to come
  // out one pixel on the screen.
  renderQuadrants(context, boxes, 0.5);

  equal(widths[0], 2);
  equal(rects.length, boxes.length, 'one box each, none skipped');
});

/**
 * The panel is drawn in canvas pixels, over a context the world was drawn into
 * scaled — so it must leave the transform exactly as it found it, or the next
 * frame of the simulation comes out the wrong size.
 */
test('Drawing the panel leaves the context as it found it', () => {
  const calls: string[] = [];
  const context = {
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    fillRect: () => calls.push('fillRect'),
    strokeRect: () => calls.push('strokeRect'),
    fillText: (text: string) => calls.push(`fillText(${text})`),
  } as unknown as CanvasRenderingContext2D;

  renderDebugPanel(context, {
    fps: 60,
    msPerTick: 0.5,
    plants: 1,
    herbivores: 2,
    carnivores: 3,
    energy: 1234,
  });

  equal(calls[0], 'save');
  equal(calls[calls.length - 1], 'restore');
  ok(calls.some((call) => call.startsWith('fillText(fps')), 'the fps row is drawn');
});
