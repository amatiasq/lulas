import { round } from '../../src/math';

export function toBeAprox(received, argument, decimals = 2) {
  const pass =
    received === argument ||
    round(received, decimals) === round(argument, decimals);

  return {
    message: pass
      ? () => `expected ${received} not to be aproximately ${argument}`
      : () => `expected ${received} to be aproximately ${argument}`,
    pass,
  };
}
