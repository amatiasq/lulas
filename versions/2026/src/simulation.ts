import {
  INITIAL_CARNIVORES,
  INITIAL_HERBIVORES,
  INITIAL_PLANTS,
  PLANT_MAX_COUNT,
  PLANT_SEED_INTERVAL,
} from './CONFIGURATION';
import { createEntity, Entity, EntityType, maxSpeedOf } from './entity';
import { random } from './math';
import { render } from './render';
import { step } from './step';
import { Vector } from './vector';
import { randomPosition, World, world } from './world';

export interface SimulationConfig {
  canvas: HTMLCanvasElement;
  entities?: Entity[];
  worldSize?: Vector;
}

export function simulation({
  canvas,
  worldSize = { x: canvas.width, y: canvas.height },
  entities = populate(worldSize),
}: SimulationConfig) {
  const map: World = world(worldSize);
  const context = canvas.getContext('2d')!;
  let ticks = 0;

  return {
    get entities() {
      return entities;
    },
    get world() {
      return map;
    },
    step() {
      entities = step(entities, map);

      // Seeding lives here rather than in `step` so a tick stays deterministic
      // for the tests. It is part of the plant energy source, not a second one
      // — see AGENTS.md invariant 8.
      if (++ticks % PLANT_SEED_INTERVAL === 0 && plantCount(entities) < PLANT_MAX_COUNT) {
        entities.push(spawn('plant', worldSize));
      }
    },
    render() {
      render(context, worldSize, entities);
    },
  };
}

export function populate(worldSize: Vector): Entity[] {
  return [
    ...times(INITIAL_PLANTS, () => spawn('plant', worldSize)),
    ...times(INITIAL_HERBIVORES, () => spawn('herbivore', worldSize)),
    ...times(INITIAL_CARNIVORES, () => spawn('carnivore', worldSize)),
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
