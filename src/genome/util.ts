export const uniq = <T>(x: Iterable<T>) => Array.from(new Set(x));

export function arrayToObject<T, U>(list: T[], getValue: (x: T) => U) {
  return Object.fromEntries(list.map(x => [x, getValue(x)]));
}

export function parseGeneCode(gene: string) {
  const match = gene.match(/^([A-Z])(\d+)?/);
  const [_, letter, number] = match || [];

  if (!letter) {
    throw new Error(`Invalid gene code: ${gene}`);
  }

  return [letter, number ? parseInt(number, 10) : 0] as const;
}

export function extractGenePatterns(expression: string) {
  const match = expression.match(/([A-Z](\d+)?)+/g) || [];
  return uniq(match);
}

export function extractIndividualGenes(expression: string) {
  const match = expression.match(/[A-Z](\d+)?/g) || [];
  return uniq(match);
}
