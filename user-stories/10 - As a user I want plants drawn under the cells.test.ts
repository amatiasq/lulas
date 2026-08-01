import { ok } from 'assert';

import { PALETTE } from '../src/render';
import { render } from '../src/render';
import { vector } from '../src/vector';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

/**
 * A recording stand-in for the canvas context. Only the calls `render` makes are
 * implemented, and every one of them is logged, so a spec can assert on the
 * ORDER things were drawn in — which is what "under" means on a canvas.
 */
function recordingContext() {
  const calls: string[] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push(`${name}(${args.join(',')})`);
    };

  const context = {
    calls,
    // Recorded as an event too: every shape is a circle now, so the fill colour
    // is the only thing that says whether it was a plant or a cell.
    set fillStyle(value: string) {
      calls.push(`fillStyle(${value})`);
    },
    get fillStyle() {
      return '';
    },
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    beginPath: record('beginPath'),
    arc: record('arc'),
    fill: record('fill'),
    fillRect: record('fillRect'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    stroke: record('stroke'),
    strokeStyle: '',
    lineWidth: 0,
  };

  return context as typeof context & CanvasRenderingContext2D;
}

// Everything is drawn as a circle, so what was drawn is read off the fill colour
// that was set right before it. The background fill is not followed by an arc,
// which is what drops it here.
const drawings = (calls: string[]) => {
  const drawn: string[] = [];

  for (let i = 0; i < calls.length; i++) {
    if (!calls[i].startsWith('arc(')) continue;

    const fill = calls
      .slice(0, i)
      .reverse()
      .find((call) => call.startsWith('fillStyle('))
      ?.slice('fillStyle('.length, -1);

    drawn.push(fill === PALETTE.plant.body ? 'plant' : 'cell');
  }

  return drawn;
};

test('Every plant is drawn before any cell', () => {
  const context = recordingContext();

  // Interleaved on purpose: in array order this would paint a plant over the
  // herbivore that is eating it.
  render(context, TEST_WORLD.worldSize, [
    entity('herbivore', vector(100, 100), 6),
    entity('plant', vector(300, 300), 4),
    entity('carnivore', vector(500, 500), 14),
    entity('plant', vector(700, 700), 4),
  ]);

  const order = drawings(context.calls);

  ok(order.length === 4, `expected four things drawn, got ${order.join(',')}`);
  ok(
    order.indexOf('cell') > order.lastIndexOf('plant'),
    `plants must all come first, got ${order.join(',')}`,
  );
});

test('A herbivore sitting on a plant is drawn on top of it', () => {
  const context = recordingContext();

  render(context, TEST_WORLD.worldSize, [
    entity('herbivore', vector(500, 500), 8),
    entity('plant', vector(500, 500), 4),
  ]);

  const order = drawings(context.calls);

  ok(order[0] === 'plant' && order[1] === 'cell', order.join(','));
});
