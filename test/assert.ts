// Minimal assert, aliased over the Node `assert` module (see vite.config.ts).
// The npm `assert` polyfill drags in `util`/`process`, which throw
// `process is not defined` in the browser bundle. Only the tiny surface the
// tests use is implemented here; it works identically in the browser and in
// Vitest's node environment.

export class AssertionError extends Error {
  constructor(message?: string) {
    super(message || 'Assertion failed');
    this.name = 'AssertionError';
  }
}

function assert(value: unknown, message?: string): asserts value {
  if (!value) throw new AssertionError(message);
}

export function ok(value: unknown, message?: string): asserts value {
  assert(value, message);
}

// Node's assert.equal uses loose (`==`) comparison; match that.
export function equal(actual: unknown, expected: unknown, message?: string) {
  assert(actual == expected, message ?? `${actual} == ${expected}`);
}

export function notEqual(actual: unknown, expected: unknown, message?: string) {
  assert(actual != expected, message ?? `${actual} != ${expected}`);
}

assert.ok = ok;
assert.equal = equal;
assert.notEqual = notEqual;
assert.AssertionError = AssertionError;

export default assert;
