import { Entity, EntityType } from './entity';

/**
 * What is on whose menu. Herbivores never eat herbivores, carnivores never eat
 * plants; a carnivore may eat another carnivore, but only as a fallback — that
 * ordering lives in `behavior.ts`, not here.
 */
const MENU: Record<EntityType, readonly EntityType[]> = {
  plant: [],
  herbivore: ['plant'],
  carnivore: ['herbivore', 'carnivore'],
};

export function isOnMenu(eater: Entity, target: Entity) {
  return MENU[eater.type].includes(target.type);
}

/**
 * Two predicates, both required: the right TYPE and a strictly bigger SIZE.
 *
 * Plants are the exception the spec makes — they do not fight back, so any
 * herbivore eats any plant. Between animals `>` is deliberate: equal sizes never
 * eat, in either direction. A `>=` here turns the outcome into a coin flip
 * decided by iteration order.
 */
export function canEat(eater: Entity, target: Entity) {
  if (!isOnMenu(eater, target)) return false;
  if (target.type === 'plant') return true;
  return eater.size > target.size;
}

/**
 * Fear is the same predicate, inverted. One function for both the threat scan
 * and the eat resolution, so they cannot drift apart: a cell flees exactly what
 * could eat it, which is why a herbivore ignores a bigger herbivore and a
 * carnivore ignores a bigger herbivore too.
 */
export function flees(cell: Entity, other: Entity) {
  return canEat(other, cell);
}
