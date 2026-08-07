import { MAX_SPEED_SCALE, MIN_SPEED_SCALE } from './CONFIGURATION';

/** What the controls need from the simulation. */
export interface Controllable {
  step(): void;
  back(): void;
  readonly behind: number;
}

export interface Controls {
  readonly isPaused: boolean;
  /** Whether the debug panel is showing. Toggled with **D**. */
  readonly isDebug: boolean;
  /** Simulation steps per animation frame. 1 is real time. */
  readonly speed: number;
  /** One line for the tab title — the canvas carries no numbers. */
  readonly status: string;
  /** Returns false when the key means nothing here, so the page can ignore it. */
  press(code: string, key?: string): boolean;
  /** Call once per animation frame. Runs however many steps the speed asks for. */
  frame(): void;
}

/** Time control and the debug toggle, kept away from the DOM so a spec can reach
 * them: the page only turns keydown into `press()` and rAF into `frame()`. */
export function controls(game: Controllable): Controls {
  let isPaused = false;
  let isDebug = false;
  let speed = 1;
  // The remainder of a fractional speed, or 0.5 truncates to zero steps a frame.
  let pending = 0;

  function scale(factor: number) {
    speed = Math.min(MAX_SPEED_SCALE, Math.max(MIN_SPEED_SCALE, speed * factor));
    pending = 0;
  }

  return {
    get isPaused() {
      return isPaused;
    },
    get isDebug() {
      return isDebug;
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

        case code === 'KeyD':
          isDebug = !isDebug;
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
