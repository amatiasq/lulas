import { Rectangle } from '@amatiasq/geometry';
import { Entity, energyOf } from './entity';
import { PALETTE } from './render';

export interface DebugStats {
  /** Frames the browser draws, not ticks simulated. */
  fps: number;
  /** Milliseconds one tick costs, averaged. 0 before the first one. */
  msPerTick: number;
  plants: number;
  herbivores: number;
  carnivores: number;
  /** Total area in px². Invariant 8's budget in one number: climbing forever or
   * falling to nothing says which side is winning long before the populations
   * do. */
  energy: number;
}

const PANEL_MARGIN = 12;
const PANEL_PADDING = 10;
const PANEL_WIDTH = 180;
const LINE_HEIGHT = 15;
const FONT = '12px ui-monospace, SFMono-Regular, Menlo, monospace';

// Dim on purpose: the grid is a hundred boxes over a black world and the cells
// have to stay the thing you are looking at.
const QUADRANT_COLOR = 'rgba(120, 160, 255, 0.28)';
const QUADRANT_LINE_WIDTH = 1;

const PANEL_BACKGROUND = 'rgba(0, 0, 0, 0.72)';
const PANEL_BORDER = '#333333';
const LABEL_COLOR = '#8c8c8c';
const VALUE_COLOR = '#e8e8e8';

/** A rolling mean, so a single slow frame does not make the panel jump. */
export function rollingAverage(size = 30) {
  const samples: number[] = [];

  return {
    add(value: number) {
      samples.push(value);
      if (samples.length > size) samples.shift();
    },
    get value() {
      if (samples.length === 0) return 0;
      return samples.reduce((total, sample) => total + sample, 0) / samples.length;
    },
  };
}

/** Averaged over the gaps rather than counted per second: a count needs a whole
 * second to say anything, and the panel is opened to watch a number move. */
export function fpsMeter(size = 30) {
  const gaps = rollingAverage(size);
  let previous = 0;

  return {
    sample(now: number) {
      // The first timestamp is a gap from nothing.
      if (previous) gaps.add(now - previous);
      previous = now;
    },
    get fps() {
      return gaps.value ? 1000 / gaps.value : 0;
    },
  };
}

export function countByType(entities: Entity[]) {
  let plants = 0;
  let herbivores = 0;
  let carnivores = 0;

  for (const entity of entities) {
    if (entity.type === 'plant') plants++;
    else if (entity.type === 'herbivore') herbivores++;
    else carnivores++;
  }

  return { plants, herbivores, carnivores };
}

export function totalEnergy(entities: Entity[]) {
  return entities.reduce((total, entity) => total + energyOf(entity), 0);
}

/** Separate from drawing so a spec can read what the panel says without a canvas. */
export function debugRows(stats: DebugStats): [string, string, string][] {
  const { plants, herbivores, carnivores } = stats;

  return [
    ['fps', Math.round(stats.fps).toString(), VALUE_COLOR],
    ['tick', `${stats.msPerTick.toFixed(2)} ms`, VALUE_COLOR],
    ['cells', (plants + herbivores + carnivores).toString(), VALUE_COLOR],
    ['· plants', plants.toString(), PALETTE.plant.rim],
    ['· herbivores', herbivores.toString(), PALETTE.herbivore.rim],
    ['· carnivores', carnivores.toString(), PALETTE.carnivore.rim],
    ['energy', `${compact(stats.energy)} px²`, VALUE_COLOR],
  ];
}

/** In WORLD units, so the caller draws it inside the same transform as the cells
 * and passes the scale — a line one world unit wide is a fat band on a world
 * drawn small. */
export function renderQuadrants(
  context: CanvasRenderingContext2D,
  quadrants: Rectangle[],
  scale: number,
) {
  context.save();
  context.strokeStyle = QUADRANT_COLOR;
  context.lineWidth = QUADRANT_LINE_WIDTH / scale;

  for (const { left, top, width, height } of quadrants) {
    context.strokeRect(left, top, width, height);
  }

  context.restore();
}

/** In canvas pixels, NOT world units — the caller restores the transform first,
 * or the panel comes out a different size on every screen. */
export function renderDebugPanel(
  context: CanvasRenderingContext2D,
  stats: DebugStats,
) {
  const rows = debugRows(stats);
  const height = PANEL_PADDING * 2 + rows.length * LINE_HEIGHT;

  context.save();

  context.fillStyle = PANEL_BACKGROUND;
  context.strokeStyle = PANEL_BORDER;
  context.lineWidth = 1;
  context.fillRect(PANEL_MARGIN, PANEL_MARGIN, PANEL_WIDTH, height);
  context.strokeRect(PANEL_MARGIN, PANEL_MARGIN, PANEL_WIDTH, height);

  context.font = FONT;
  context.textBaseline = 'top';

  const left = PANEL_MARGIN + PANEL_PADDING;
  const right = PANEL_MARGIN + PANEL_WIDTH - PANEL_PADDING;

  rows.forEach(([label, value, color], i) => {
    const y = PANEL_MARGIN + PANEL_PADDING + i * LINE_HEIGHT;

    context.textAlign = 'left';
    context.fillStyle = LABEL_COLOR;
    context.fillText(label, left, y);

    // Right-aligned, so the digits line up and a changing number does not make
    // the whole row shuffle sideways.
    context.textAlign = 'right';
    context.fillStyle = color;
    context.fillText(value, right, y);
  });

  context.restore();
}

/** 1234 → `1.2k`. The energy of a full world is five digits and nobody reads them. */
function compact(value: number) {
  if (value < 1000) return Math.round(value).toString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}k`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}
