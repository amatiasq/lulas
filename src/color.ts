import { random } from './math';

export type Color = '[string Color]';

export function randomColor() {
  return toString({
    r: random(100, 200),
    g: random(100, 200),
    b: random(100, 200),
    a: 1,
  });
}

export function bajarColor(color: Color, percent: number) {
  const rgba = toRGBA(color);
  rgba.r *= percent;
  rgba.g *= percent;
  rgba.b *= percent;
  // rgba.a *= percent;
  return toString(rgba);
}

function toRGBA(color: Color): RGBA {
  const match = color.match(/#(\w{2})(\w{2})(\w{2})(\w{2})?/);

  if (!match) {
    throw new Error(`DAFUK COLOR IS DIS? ${color}`);
  }

  const [_, r, g, b, a] = match;

  return {
    r: parseInt(r, 16),
    g: parseInt(g, 16),
    b: parseInt(b, 16),
    a: a ? parseInt(a, 16) / 255 : 1,
  };
}

function toString({ r, g, b, a: alpha }: RGBA): Color {
  const a = toHex(Math.round(alpha * 255));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a}` as Color;
}

function toHex(val: number) {
  const result = Math.round(val).toString(16);
  return result.length === 1 ? `0${result}` : result;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
