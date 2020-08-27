export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y = x): Point {
  return { x, y };
}

export function isPointZero({ x, y }: Point) {
  return x === 0 && y === 0;
}

export function pointMagnitude({ x, y }: Point) {
  return Math.sqrt(x ** 2 + y ** 2);
}

export function normalizePoint(point: Point, targetMagnitude = 1) {
  if (isPointZero(point)) {
    return { ...point };
  }

  const magnitude = pointMagnitude(point);
  return pointAxis((axis) => (point[axis] * targetMagnitude) / magnitude);
}

export function sumPoints(left: Point, right: Point): Point {
  return pointAxis((axis) => left[axis] + right[axis]);
}

export function subtractPoints(left: Point, right: Point) {
  return pointAxis((axis) => left[axis] - right[axis]);
}

export function multiplyPoint(point: Point, value: number) {
  return pointAxis((axis) => point[axis] * value);
}

export function pointAxis(operate: (key: 'x' | 'y') => number): Point;
export function pointAxis(operate: (key: 'x' | 'y') => void): void;
export function pointAxis(
  operate: (key: 'x' | 'y') => number | void,
): Point | void {
  const x = operate('x');
  const y = operate('y');

  if (typeof x === 'number' && typeof y === 'number') {
    return { x, y };
  }
}

export function logPoint(point: Point) {
  return `(${point.x},${point.y})`;
}
