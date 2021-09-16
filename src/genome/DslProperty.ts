import { NO_GENE } from './Gene';
import { hash } from './hash';
import * as helpers from './helpers';
import {
  arrayToObject,
  extractGenePatterns,
  extractIndividualGenes,
} from './util';

const functions = Object.entries(helpers).map(x => `const ${x.join('=')}`);

type DslExpression = (genes: Record<string, number>) => boolean | number;

export class DslProperty {
  static parse(line: string) {
    const match = line.match(/(\w+)\s*=\s*(.+)/);
    const [, prop, value] = match || [];

    if (!prop || !value) {
      throw new Error(`Invalid DSL line format:\n\t${line}`);
    }

    return new DslProperty(prop, value);
  }

  readonly patterns: string[];
  readonly genes: string[];
  private readonly compiled: DslExpression;

  private constructor(readonly name: string, readonly expression: string) {
    this.compiled = createFunction(expression) as DslExpression;
    this.patterns = extractGenePatterns(expression);
    this.genes = extractIndividualGenes(this.patterns.join('\n'));
  }

  apply(
    target: Record<string, boolean | number>,
    genes: Record<string, string>,
  ) {
    const params = arrayToObject(this.patterns, x => geneToNumber(genes[x]));
    target[this.name] = this.compiled(params);
  }
}

function createFunction(code: string) {
  const body = `
    ${functions.join(';')}
    with (genes) {
      return ${code}
    }
  `;

  return new Function('genes', body);
}

function geneToNumber(gene: string) {
  if (gene === NO_GENE) {
    return 0;
  }

  return hash(gene);
}
