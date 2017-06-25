const ROUND_DECIMALS = 2;
const ROUND_OPERATOR = Math.pow(10, ROUND_DECIMALS);
export const MAX_DEGREES = 360;
export const DEGREES_IN_PI_RADIANS = 180;


export function degreesToRadians(degrees: number): number {
  degrees = degrees % MAX_DEGREES;

  if (degrees < 0)
    degrees += MAX_DEGREES;

  return degrees * Math.PI / DEGREES_IN_PI_RADIANS;
}


export function round(value: number): number {
  return Math.round(value * ROUND_OPERATOR) / ROUND_OPERATOR;
}
