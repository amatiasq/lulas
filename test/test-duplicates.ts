import { createEntity, Entity, EntityType } from '../src/entity';
import { vector, Vector } from '../src/vector';
import { world, World } from '../src/world';

export const TEST_WORLD: World = world(vector(1000, 1000));

export function entity(
  type: EntityType,
  position: Vector,
  size?: number,
): Entity {
  return createEntity(type, {
    position: { ...position },
    ...(size == null ? {} : { size }),
  });
}
