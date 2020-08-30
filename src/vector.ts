export interface Vector {
  x: number;
  y: number;
}

export function vector(x: number, y = x): Vector {
  return { x, y };
}

export function isZero({ x, y }: Vector) {
  return x === 0 && y === 0;
}

export function magnitude({ x, y }: Vector) {
  return Math.sqrt(x ** 2 + y ** 2);
}

export function normalize(point: Vector, targetMagnitude = 1) {
  if (isZero(point)) {
    return { ...point };
  }

  const mag = magnitude(point);
  return vectorAxis((axis) => (point[axis] * targetMagnitude) / mag);
}

export function radians({ x, y }: Vector) {
  return Math.atan2(y, x);
}

export function getAngle(vector: Vector) {
  return (radians(vector) * 180) / Math.PI;
}

export function limitVector(point: Vector, limit: number) {
  const mag = magnitude(point);
  return mag > limit ? normalize(point, limit) : point;
}

export function sumVectors(left: Vector, right: Vector): Vector {
  return vectorAxis((axis) => left[axis] + right[axis]);
}

export function sumVectorList(vectors: Vector[]): Vector {
  return vectorAxis((axis) =>
    vectors.map((v) => v[axis]).reduce((a, b) => a + b),
  );
}

export function subtractVectors(left: Vector, right: Vector) {
  return vectorAxis((axis) => left[axis] - right[axis]);
}

export function multiplyVectors(point: Vector, value: number) {
  return vectorAxis((axis) => point[axis] * value);
}

export function vectorAxis(operate: (key: 'x' | 'y') => number): Vector;
export function vectorAxis(operate: (key: 'x' | 'y') => void): void;
export function vectorAxis(
  operate: (key: 'x' | 'y') => number | void,
): Vector | void {
  const x = operate('x');
  const y = operate('y');

  if (typeof x === 'number' && typeof y === 'number') {
    return { x, y };
  }
}

export function logVector(point: Vector) {
  return `(${point.x},${point.y})`;
}
