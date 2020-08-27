import * as assert from 'assert';

export function assertBetween(
  value: number,
  first: number,
  second: number,
  message = '',
) {
  const min = Math.min(first, second);
  const max = Math.max(first, second);
  const finalMessage = `Expected ${value} to be between ${min} and ${max} (${message})`;

  if (min === max) {
    assert(value === min, finalMessage);
    return;
  }

  assert(value > min, finalMessage);
  assert(value < max, finalMessage);
}
