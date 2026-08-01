import { MAX_SPEED_SCALE, MIN_SPEED_SCALE } from './CONFIGURATION';

/** What the controls need from the simulation. */
export interface Controllable {
  step(): void;
  back(): void;
  readonly behind: number;
}

export interface Controls {
  readonly isPaused: boolean;
  /** Simulation steps per animation frame. 1 is real time. */
  readonly speed: number;
  /** One line for the tab title — the canvas carries no numbers. */
  readonly status: string;
  /** Returns false when the key means nothing here, so the page can ignore it. */
  press(code: string, key?: string): boolean;
  /** Call once per animation frame. Runs however many steps the speed asks for. */
  frame(): void;
}

/**
 * Time control, kept away from the DOM so it can be tested: the page only turns
 * keydown into `press()` and requestAnimationFrame into `frame()`.
 *
 * - **space** pauses.
 * - **left / right** walk one frame at a time, and pause — right off the end of
 *   history computes a new frame, so you can step forward through a chase.
 * - **+ / −** halve and double the speed, from one step every eight frames to
 *   eight steps per frame.
 */
export function controls(game: Controllable): Controls {
  let isPaused = false;
  let speed = 1;
  // Fractional speeds need somewhere to keep the remainder, or 0.5 truncates to
  // zero steps every frame and the simulation just stops.
  let pending = 0;

  function scale(factor: number) {
    speed = Math.min(MAX_SPEED_SCALE, Math.max(MIN_SPEED_SCALE, speed * factor));
    pending = 0;
  }

  return {
    get isPaused() {
      return isPaused;
    },
    get speed() {
      return speed;
    },
    get status() {
      const rate = speed === 1 ? '' : ` ×${speed}`;
      if (!isPaused) return `lulas${rate}`;

      const behind = game.behind ? `, ${game.behind} frames back` : '';
      return `lulas — paused${behind}${rate}`;
    },

    press(code, key) {
      switch (true) {
        case code === 'Space':
          isPaused = !isPaused;
          return true;

        case code === 'ArrowLeft':
          isPaused = true;
          game.back();
          return true;

        case code === 'ArrowRight':
          isPaused = true;
          game.step();
          return true;

        // `+` and `-` sit in different places on different layouts, and on a
        // Spanish one `+` needs a modifier, so match the character too.
        case key === '+' || code === 'NumpadAdd' || code === 'Equal':
          scale(2);
          return true;

        case key === '-' || code === 'NumpadSubtract' || code === 'Minus':
          scale(0.5);
          return true;

        default:
          return false;
      }
    },

    frame() {
      if (isPaused) return;

      pending += speed;

      while (pending >= 1) {
        game.step();
        pending--;
      }
    },
  };
}
