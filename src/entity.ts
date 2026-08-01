import {
  CARNIVORE_INITIAL_SIZE,
  CARNIVORE_MAX_SPEED,
  CARNIVORE_MITOSIS_SIZE,
  CARNIVORE_VISION_RANGE,
  HERBIVORE_INITIAL_SIZE,
  HERBIVORE_MAX_SPEED,
  HERBIVORE_MITOSIS_SIZE,
  HERBIVORE_VISION_RANGE,
  MIN_SIZE,
  PLANT_INITIAL_SIZE,
} from './CONFIGURATION';
import { logVector, Vector, vector } from './vector';
import { shortestDistance } from './world';

export type EntityType = 'plant' | 'herbivore' | 'carnivore';

export type EntityId = '[number EntityId]';
let lastId = 0;

function getNextId() {
  return lastId++ as unknown as EntityId;
}

export interface Entity {
  id: EntityId;
  type: EntityType;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  /** Radius. Energy is derived from it; see `energyOf`. */
  size: number;
}

const INITIAL_SIZE: Record<EntityType, number> = {
  plant: PLANT_INITIAL_SIZE,
  herbivore: HERBIVORE_INITIAL_SIZE,
  carnivore: CARNIVORE_INITIAL_SIZE,
};

const VISION_RANGE: Record<EntityType, number> = {
  plant: 0,
  herbivore: HERBIVORE_VISION_RANGE,
  carnivore: CARNIVORE_VISION_RANGE,
};

const MAX_SPEED: Record<EntityType, number> = {
  plant: 0,
  herbivore: HERBIVORE_MAX_SPEED,
  carnivore: CARNIVORE_MAX_SPEED,
};

// Plants grow to a cap and stop; only animals divide.
const MITOSIS_SIZE: Record<EntityType, number> = {
  plant: Infinity,
  herbivore: HERBIVORE_MITOSIS_SIZE,
  carnivore: CARNIVORE_MITOSIS_SIZE,
};

export function createEntity(
  type: EntityType,
  partial: Partial<Entity> = {},
): Entity {
  return {
    id: getNextId(),
    type,
    position: vector(0),
    velocity: vector(0),
    acceleration: vector(0),
    size: INITIAL_SIZE[type],
    ...partial,
  };
}

export function isAnimal(entity: Entity) {
  return entity.type !== 'plant';
}

export function visionOf(entity: Entity) {
  return VISION_RANGE[entity.type];
}

export function maxSpeedOf(entity: Entity) {
  return MAX_SPEED[entity.type];
}

export function mitosisSizeOf(entity: Entity) {
  return MITOSIS_SIZE[entity.type];
}

export function isAlive(entity: Entity) {
  return entity.size >= MIN_SIZE;
}

/**
 * Energy IS area. Ported from `recover/ts-2020/src/cell/CellBody.ts` — with one
 * field for both, "eating transfers area", "movement burns area" and "mitosis
 * loses half the area" all become arithmetic on the same number.
 */
export function energyOf(entity: Entity) {
  return Math.PI * entity.size ** 2;
}

export function setEnergy(entity: Entity, energy: number) {
  entity.size = energy <= 0 ? 0 : Math.sqrt(energy / Math.PI);
}

/** Clamped at zero: nothing ever ends up with negative area. */
export function addEnergy(entity: Entity, delta: number) {
  setEnergy(entity, energyOf(entity) + delta);
}

export function isTouching(left: Entity, right: Entity, size: Vector) {
  return (
    shortestDistance(left.position, right.position, size) <
    left.size + right.size
  );
}

export function logEntity(entity: Entity) {
  return `${entity.type}(${entity.id}) r=${entity.size.toFixed(2)} { pos: ${logVector(
    entity.position,
  )}, vel: ${logVector(entity.velocity)} }`;
}
