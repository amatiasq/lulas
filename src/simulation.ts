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
import { createEntity, Entity, EntityType, maxSpeedOf } from './entity';
import { random } from './math';
import { render } from './render';
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
  let ticks = 0;

  const time = timeline(entities, (previous) => {
    const next = step(previous, map);

    // Seeding lives here rather than in `step` so a tick stays deterministic for
    // the tests. It is part of the plant energy source, not a second one — see
    // AGENTS.md invariant 8. Inside the timeline's advance, though: a seedling
    // is part of the frame it appeared in, so walking back and forward again
    // replays it instead of sprouting a different one.
    if (++ticks % interval === 0 && plantCount(next) < limit) {
      next.push(spawn('plant', worldSize));
    }

    return next;
  });

  return {
    get entities() {
      return time.current;
    },
    get world() {
      return map;
    },
    /** Frames the view is behind the newest one. 0 while running normally. */
    get behind() {
      return time.behind;
    },
    step() {
      time.forward();
    },
    /** One frame into the past, as far back as HISTORY_SIZE allows. */
    back() {
      time.back();
    },
    render() {
      // The world can be bigger than the canvas (see `viableWorld`), so the
      // drawing is scaled to fit. Uniform, because the aspect ratio is kept —
      // squashed circles would lie about who is about to eat whom.
      const scale = canvas.width / worldSize.x;

      context.save();
      context.setTransform(scale, 0, 0, scale, 0, 0);
      render(context, worldSize, time.current);
      context.restore();
    },
  };
}

/**
 * The world to simulate on a canvas this size: the canvas itself, unless that is
 * so small the populations could not survive it, in which case the world is
 * grown to MIN_WORLD_SCREENFULS and drawn scaled down.
 *
 * The aspect ratio is kept, so the scaling is uniform and nothing is distorted.
 * A phone therefore shows the same simulation as a monitor, smaller — rather
 * than a fifth of the cells, which dies.
 */
export function viableWorld(canvasSize: Vector): Vector {
  const area = screenfuls(canvasSize);
  if (area >= MIN_WORLD_SCREENFULS) return canvasSize;

  const grow = Math.sqrt(MIN_WORLD_SCREENFULS / area);
  return vector(canvasSize.x * grow, canvasSize.y * grow);
}

/**
 * How many screenfuls this world is, against the screen the simulation was tuned
 * on. Everything counted per-screen goes through here, so a phone gets a sparse
 * handful and an 8K monitor gets a crowd — at the same density, which is what
 * makes the two behave alike.
 */
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

export default simulation;
