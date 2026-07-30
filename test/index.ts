// Test declaration helpers. Specs run under Vitest; this wraps its global
// `test` to add the table-driven signature the specs use. The old browser-side
// test runner (collect specs, run on page load, paint the body green/red) was
// removed — Vitest is the only runner now.

type TestRun<T extends any[]> = (...args: T) => Promise<any> | void;

// The specs still branch on this to pick the jsdom/canvas-mock code path.
// Always true now: tests only ever run under the runner.
export const isJestTesting = true;

export function test(message: string, run: TestRun<[]>): void;
export function test<T extends any[]>(
  message: string,
  table: T[],
  run: TestRun<T>,
): void;
export function test<T extends any[]>(
  message: string,
  first: TestRun<[]> | T[],
  second?: TestRun<T>,
): void {
  const runnerTest = (globalThis as any).test as (
    name: string,
    fn: TestRun<[]>,
  ) => void;
  const table = Array.isArray(first) ? first : null;
  const run = (table ? second : first) as TestRun<any>;

  if (table) {
    table.forEach((row, i) =>
      runnerTest(`${message} [${i}]`, () => run(...row)),
    );
  } else {
    runnerTest(message, run as TestRun<[]>);
  }
}

// No-op: the browser runner used this to group console output by file; Vitest
// groups by file itself. Kept so specs don't need editing.
export function setFilename(_dirname: string, _filename: string): void {}
