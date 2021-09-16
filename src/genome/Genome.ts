import { Gene, NO_GENE } from './Gene';
import { extractIndividualGenes, parseGeneCode } from './util';

export class Genome {
  readonly genes: Gene[];
  readonly genesByLetter: Record<string, Gene>;

  constructor(genes: string[]) {
    this.genes = processGenes(genes);
    this.genesByLetter = Object.fromEntries(this.genes.map(x => [x.letter, x]));
  }

  get(adn: string, geneCode: string) {
    const [letter, variation] = parseGeneCode(geneCode);
    const gene = this.genesByLetter[letter];
    if (!gene) return NO_GENE;
    return gene.getFrom(adn, variation);
  }

  getPattern(adn: string, pattern: string) {
    return extractIndividualGenes(pattern)
      .map(x => this.get(adn, x))
      .join('');
  }
}

function processGenes(genes: string[]) {
  const result: Record<string, number> = {};

  for (const gene of genes) {
    const [letter, variation] = parseGeneCode(gene);
    const prev = result[letter] || 0;
    result[letter] = Math.max(variation, prev);
  }

  let offset = 0;

  return Object.entries(result).map(([letter, variations]) => {
    const gene = new Gene(letter, variations, offset);
    offset += gene.length;
    return gene;
  });
}
