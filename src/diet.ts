import { Entity, EntityType } from './entity';

/** Carnivore-on-carnivore is on the menu but only as a fallback; that ordering
 * lives in `behavior.ts`, not here. */
const MENU: Record<EntityType, readonly EntityType[]> = {
  plant: [],
  herbivore: ['plant'],
  carnivore: ['herbivore', 'carnivore'],
};

export function isOnMenu(eater: Entity, target: Entity) {
  return MENU[eater.type].includes(target.type);
}

/** The right TYPE and a strictly bigger SIZE, both required — invariant 2. A `>=`
 * here turns the outcome into a coin flip decided by iteration order. Plants are
 * the spec's exception: they do not fight back. */
export function canEat(eater: Entity, target: Entity) {
  if (!isOnMenu(eater, target)) return false;
  if (target.type === 'plant') return true;
  return eater.size > target.size;
}

/** The same predicate inverted, so the threat scan and the eat resolution cannot
 * drift apart: a cell flees exactly what could eat it. */
export function flees(cell: Entity, other: Entity) {
  return canEat(other, cell);
}
