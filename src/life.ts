import {
  MAX_BITE_FRACTION,
  MITOSIS_SPLIT_SPEED,
  MOVEMENT_ENERGY_FACTOR,
  PLANT_GROWTH_RATE,
  PLANT_MAX_AREA,
} from './CONFIGURATION';
import {
  addEnergy,
  createEntity,
  energyOf,
  Entity,
  isAlive,
  maxSpeedOf,
  mitosisSizeOf,
} from './entity';
import {
  fromAngle,
  isZero,
  limitVector,
  magnitude,
  multiplyVectors,
  sumVectors,
  vector,
  Vector,
} from './vector';
import { wrapPosition } from './world';

export function applyForce(cell: Entity, force: Vector) {
  cell.acceleration = sumVectors(cell.acceleration, force);
}

/** Capped at a fraction of the EATER's own energy, which is what makes a big meal
 * take several ticks. From `recover/ts-2020/src/cell/CellDiet.ts`. */
export function bite(eater: Entity, prey: Entity) {
  const maxBite = energyOf(eater) * MAX_BITE_FRACTION;
  const amount = Math.min(energyOf(prey), maxBite);

  addEnergy(prey, -amount);
  addEnergy(eater, amount);

  return amount;
}

/** Plants grow, slowly, up to a cap. The only energy input in the system. */
export function grow(plant: Entity) {
  if (energyOf(plant) >= PLANT_MAX_AREA) return;
  addEnergy(plant, PLANT_GROWTH_RATE);
}

export function move(cell: Entity, worldSize: Vector) {
  if (!isZero(cell.acceleration)) {
    cell.velocity = limitVector(
      sumVectors(cell.velocity, cell.acceleration),
      maxSpeedOf(cell),
    );
    cell.acceleration = vector(0);
  }

  cell.position = wrapPosition(
    sumVectors(cell.position, cell.velocity),
    worldSize,
  );
}

/** QUADRATIC in speed, and the only place the cost lives — invariant 7. It is what
 * makes this an ecosystem: with no plants, a herbivore shrinks until it is gone. */
export function burnMovementEnergy(cell: Entity) {
  const speed = magnitude(cell.velocity);
  if (speed === 0) return 0;

  const cost = MOVEMENT_ENERGY_FACTOR * speed ** 2;
  addEnergy(cell, -cost);
  return cost;
}

export function canSplit(cell: Entity) {
  return isAlive(cell) && cell.size > mitosisSizeOf(cell);
}

/** Exactly TWO children at HALF the parent's radius, so the pair holds half its
 * area: that loss is the sink balancing the plants, do not "fix" it. From
 * `recover/js-2014/src/life/cell.js` → `reproduce`. */
export function split(parent: Entity, worldSize: Vector): [Entity, Entity] {
  const size = parent.size / 2;
  const angle = Math.random() * Math.PI * 2;
  const push = fromAngle(angle, MITOSIS_SPLIT_SPEED);

  // Offset by the parent's radius as well as shoved: born touching, they would
  // spend their first ticks overlapping.
  const offset = fromAngle(angle, parent.size);

  const child = (direction: number) =>
    createEntity(parent.type, {
      // Wrapped: a cell that splits next to an edge puts one child over it.
      position: wrapPosition(
        sumVectors(parent.position, multiplyVectors(offset, direction)),
        worldSize,
      ),
      velocity: multiplyVectors(push, direction),
      size,
    });

  return [child(1), child(-1)];
}
