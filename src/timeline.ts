import { HISTORY_SIZE } from './CONFIGURATION';
import { Entity } from './entity';

/**
 * The simulation plus its recent past. Every frame is a deep copy, because
 * `step()` hands back the same objects it mutated; and walking forward after
 * walking back REPLAYS rather than recomputes, because mitosis angles and
 * seeding are random and you have to land where you started.
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
