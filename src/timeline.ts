import { HISTORY_SIZE } from './CONFIGURATION';
import { Entity } from './entity';

/**
 * The simulation plus its recent past, so time can be stepped backwards.
 *
 * Every frame is a deep copy: `step()` mutates the entities it is given and
 * hands back those same objects, so a frame that shared them would change under
 * you and "the past" would be a copy of the present. Advancing clones first.
 *
 * While the cursor sits at the end, `forward()` computes new frames; once walked
 * back it REPLAYS instead of recomputing — mitosis angles and seeding are
 * random, so recomputing would not land where you started.
 */
export interface Timeline {
  readonly current: Entity[];
  /** How many frames back the cursor is from the newest one. 0 = the present. */
  readonly behind: number;
  readonly length: number;
  forward(): Entity[];
  back(): Entity[];
}

export function timeline(
  first: Entity[],
  advance: (entities: Entity[]) => Entity[],
  size = HISTORY_SIZE,
): Timeline {
  const frames: Entity[][] = [clone(first)];
  let cursor = 0;

  return {
    get current() {
      return frames[cursor];
    },
    get behind() {
      return frames.length - 1 - cursor;
    },
    get length() {
      return frames.length;
    },

    forward() {
      if (cursor < frames.length - 1) {
        cursor++;
        return frames[cursor];
      }

      frames.push(advance(clone(frames[cursor])));

      // Ring: drop the oldest frame instead of growing forever.
      if (frames.length > size) frames.shift();

      cursor = frames.length - 1;
      return frames[cursor];
    },

    back() {
      if (cursor > 0) cursor--;
      return frames[cursor];
    },
  };
}

function clone(entities: Entity[]): Entity[] {
  return entities.map((entity) => ({
    ...entity,
    position: { ...entity.position },
    velocity: { ...entity.velocity },
    acceleration: { ...entity.acceleration },
  }));
}
