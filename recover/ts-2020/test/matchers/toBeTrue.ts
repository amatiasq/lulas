export function toBeTrue(received) {
  const pass = received === true;

  return {
    message: pass
      ? () => `expected ${received} not to be true`
      : () => `expected ${received} to be true`,
    pass,
  };
}
