export function toBeFalse(received) {
  const pass = received === false;

  return {
    message: pass
      ? () => `expected ${received} not to be false`
      : () => `expected ${received} to be false`,
    pass,
  };
}
