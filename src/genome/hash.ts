import { createHash } from 'crypto';

export function hash(value: string) {
  const int8 = createHash('sha1').update(value).digest().readInt8(0);
  return (int8 + 128) / 255;
}
