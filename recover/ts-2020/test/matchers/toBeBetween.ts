import { max, min } from '../../src/math';

export function toBeBetween(received, a, b) {
  const first = min(a, b);
  const second = max(a, b);
  const pass = first < received && received < second;

  return {
    message: pass
      ? () => `expected ${received} not to be between ${a} and ${b}`
      : () => `expected ${received} to be between ${a} and ${b}`,
    pass,
  };
}
