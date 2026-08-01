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

/**
 * One bite, capped at a fraction of the EATER's own energy — that cap is what
 * makes a big meal take several ticks. The prey shrinks and the eater grows in
 * the same step, and the transfer can never take more than is there.
 *
 * Ported from `recover/ts-2020/src/cell/CellDiet.ts`.
 */
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

/**
 * Moving costs area, QUADRATICALLY in speed. Small per tick, never stops, and it
 * is what makes this an ecosystem instead of a screensaver: with no plants, a
 * herbivore shrinks until it is gone.
 */
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

/**
 * Mitosis: exactly TWO children, each at HALF the parent's radius, leaving in
 * opposite directions.
 *
 * Half the radius is a quarter of the area each, so the two together hold half
 * of what the parent had. That loss is the energy sink balancing the plants —
 * do not "fix" it. Ported from `recover/js-2014/src/life/cell.js` → `reproduce`.
 */
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
