import { Chromosome } from './Chromosome';

export type DslDefinition = Record<string, string>;

const parseRange = (range: string) =>
  range.split(',').map(x => parseInt(x)) as [number, number];

export function computeDsl(
  chromosome: Chromosome,
  dslDefinition: DslDefinition,
) {
  const properties: Record<string, number | boolean | null> = {};

  for (const [name, dsl] of Object.entries(dslDefinition)) {
    const [type, ...codes] = dsl.split(' ');
    properties[name] =
      type === 'B'
        ? chromosome.getBool(codes)
        : type === 'N'
        ? chromosome.getNumber(codes, ...parseRange(codes.shift()!))
        : null;
  }

  return properties;
}
