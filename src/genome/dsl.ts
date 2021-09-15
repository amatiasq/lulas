import { uniq } from './util';

const functions = {
  bool: (x: number) => x > 0.5,
  cap: (x: number, a: number, b: number) => {
    const min = a < b ? a : b;
    const max = a < b ? b : a;
    return x * (max - min) + min;
  },
};

// Types

export type Genes = Record<string, number>;

export interface ParsedDsl {
  [key: string]: (genes: Genes) => boolean | number;
}

export interface ParseResult {
  usedGenes: string[];
  properties: ParsedDsl;
  apply(target: any, genes: Genes): void;
}

// Exported function

export function parseDsl(dsl: string) {
  const properties = compileProperties(dsl);
  const usedGenes = extractGenePatterns(dsl);
  const genes = extractIndividualGenes(usedGenes);
}

function compileProperties(dsl: string) {
  const lines = dsl
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean);

  const compiled = lines
    .map(parsePropertyLine)
    .map(({ prop, value }) => [prop, createFunction(value)]);

  return Object.fromEntries(compiled) as ParsedDsl;
}

function parsePropertyLine(line: string) {
  try {
    const [, prop, value] = line.match(/(\w+)\s*=\s*(.+)/)!;
    return { prop, value };
  } catch (error) {
    throw new Error(`Invalid DSL line format:\n\t${line}`);
  }
}

// function execute(props: ParsedDsl, genes: Genes) {
//   const entries = Object.entries(props);
//   entries.forEach(x => (x[1] = x[1](genes)));
//   return Object.fromEntries(entries);
// }

const helpers = Object.entries(functions).map(x => `const ${x.join('=')}`);

function createFunction(code: string) {
  const body = `
    ${helpers.join(';')}
    with (genes) {
      return ${code}
    }
  `;

  return new Function('genes', body);
}

function extractGenePatterns(dsl: string) {
  const match = dsl.match(/\b([A-Z](\d+)?)+\b/g) || [];
  return uniq(match);
}

export function extractIndividualGenes(genes: string[]) {
  const match = genes.join('').match(/[A-Z](\d+)?/g) || [];
  return uniq(match);
}
