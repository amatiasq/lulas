export function arrayOf<T = null>(length: 2, generator?: () => T): [T, T];
export function arrayOf<T = null>(length: number, generator?: () => T): T[];

export function arrayOf<T = null>(length: number, generator?: () => T) {
  const array = Array(length).fill(null) as null[];
  return generator ? array.map(generator) : array;
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomBool() {
  return Math.random() < 0.5;
}

export function randomItem<T>(list: T[]) {
  return list[random(0, list.length)];
}
