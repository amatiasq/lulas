import {
  CARNIVORES_PER_SCREEN,
  HERBIVORES_PER_SCREEN,
  PLANT_LIMIT_PER_SCREEN,
  MIN_WORLD_SCREENFULS,
  PLANT_SEED_INTERVAL,
  PLANTS_PER_SCREEN,
  REFERENCE_HEIGHT,
  REFERENCE_WIDTH,
} from './CONFIGURATION';
import {
  countByType,
  DebugStats,
  renderDebugPanel,
  renderQuadrants,
  rollingAverage,
  totalEnergy,
} from './debug';
import { createEntity, Entity, EntityType, maxSpeedOf } from './entity';
import { random } from './math';
import { render } from './render';
import { indexEntities } from './spatial';
import { step } from './step';
import { timeline } from './timeline';
import { vector, Vector } from './vector';
import { randomPosition, World, world } from './world';

export interface SimulationConfig {
  canvas: HTMLCanvasElement;
  entities?: Entity[];
  worldSize?: Vector;
}

export function simulation({
  canvas,
  worldSize = viableWorld(vector(canvas.width, canvas.height)),
  entities = populate(worldSize),
}: SimulationConfig) {
  const map: World = world(worldSize);
  const interval = seedInterval(worldSize);
  const limit = plantLimit(worldSize);
  const context = canvas.getContext('2d')!;
  const tickTime = rollingAverage();
  let ticks = 0;

  const time = timeline(entities, (previous) => {
    const next = step(previous, map);

    // Outside `step` so a tick stays deterministic for the specs, but inside the
    // timeline's advance so walking back and forward replays the same seedling.
    if (++ticks % interval === 0 && plantCount(next) < limit) {
      next.push(spawn('plant', worldSize));
    }

    return next;
  });

  function stats(fps: number): DebugStats {
    const entities = time.current;

    return {
      fps,
      msPerTick: tickTime.value,
      ...countByType(entities),
      energy: totalEnergy(entities),
    };
  }

  return {
    get entities() {
      return time.current;
    },
    /** The frame rate is the page's to measure; nothing here sees a rAF timestamp. */
    debug: stats,
    get world() {
      return map;
    },
    /** Frames the view is behind the newest one. 0 while running normally. */
    get behind() {
      return time.behind;
    },
    step() {
      // The panel's ms/tick measures `forward`, not `step`: the deep copy is part
      // of what a tick costs, and replayed frames are genuinely that cheap.
      const start = performance.now();
      time.forward();
      tickTime.add(performance.now() - start);
    },
    /** One frame into the past, as far back as HISTORY_SIZE allows. */
    back() {
      time.back();
    },
    /** The world, and — when the page passes an fps — the debug panel over it. */
    render(fps?: number) {
      // The world can be bigger than the canvas (`viableWorld`). Uniform because
      // squashed circles would lie about who is about to eat whom.
      const scale = canvas.width / worldSize.x;

      context.save();
      context.setTransform(scale, 0, 0, scale, 0, 0);
      render(context, worldSize, time.current);

      // Rebuilt, not kept from the tick: `step`'s index was over the positions
      // BEFORE anything moved, and this is the frame on the screen. The
      // perception tree only — `resolveCollisions` builds a near-identical one
      // over the animals alone. After `render`, which paints over anything under it.
      if (fps != null) {
        renderQuadrants(
          context,
          indexEntities(time.current, worldSize).quadrants(),
          scale,
        );
      }

      context.restore();

      // Outside the transform: the panel is measured in screen pixels.
      if (fps != null) renderDebugPanel(context, stats(fps));
    },
  };
}

/** The canvas itself, unless that is too small for the populations to survive it
 * — then MIN_WORLD_SCREENFULS, same aspect ratio, drawn scaled down. A phone
 * shows the same simulation as a monitor, smaller; a fifth of the cells dies. */
export function viableWorld(canvasSize: Vector): Vector {
  const area = screenfuls(canvasSize);
  if (area >= MIN_WORLD_SCREENFULS) return canvasSize;

  const grow = Math.sqrt(MIN_WORLD_SCREENFULS / area);
  return vector(canvasSize.x * grow, canvasSize.y * grow);
}

/** This world measured against the screen it was all tuned on. Every per-screen
 * figure goes through here, so every screen gets the same density. */
export function screenfuls(worldSize: Vector) {
  return (worldSize.x * worldSize.y) / (REFERENCE_WIDTH * REFERENCE_HEIGHT);
}

/** Per-screen figure to a real count, never rounding a population down to none. */
function perScreen(amount: number, worldSize: Vector) {
  return Math.max(1, Math.round(amount * screenfuls(worldSize)));
}

export function plantLimit(worldSize: Vector) {
  return perScreen(PLANT_LIMIT_PER_SCREEN, worldSize);
}

/** Ticks between seedlings: twice the world, twice as often. */
export function seedInterval(worldSize: Vector) {
  return Math.max(1, Math.round(PLANT_SEED_INTERVAL / screenfuls(worldSize)));
}

export function populate(worldSize: Vector): Entity[] {
  const count = (amount: number) => perScreen(amount, worldSize);

  return [
    ...times(count(PLANTS_PER_SCREEN), () => spawn('plant', worldSize)),
    ...times(count(HERBIVORES_PER_SCREEN), () => spawn('herbivore', worldSize)),
    ...times(count(CARNIVORES_PER_SCREEN), () => spawn('carnivore', worldSize)),
  ];
}

function spawn(type: EntityType, worldSize: Vector) {
  const entity = createEntity(type, { position: randomPosition(worldSize) });
  const speed = maxSpeedOf(entity) / 2;

  entity.velocity = { x: random(speed), y: random(speed) };
  return entity;
}

function plantCount(entities: Entity[]) {
  return entities.reduce(
    (total, entity) => (entity.type === 'plant' ? total + 1 : total),
    0,
  );
}

function times<T>(count: number, create: () => T): T[] {
  return Array.from({ length: count }, create);
}
