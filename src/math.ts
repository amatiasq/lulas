export function getSign(value: number) {
  if (value === 0) {
    return 0;
  }

  return value / Math.abs(value);
}
