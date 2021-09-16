import { parseGeneCode } from './util';

export const NO_GENE = '';

export class Gene {
  readonly length: number;

  constructor(
    readonly letter: string,
    readonly variations: number,
    readonly offset: number,
  ) {
    this.length = letter.length + `${variations}`.length;
  }

  getFrom(adn: string, expectedVariation = 0) {
    const chunk = adn.substr(this.offset, this.length);

    if (chunk[0] !== this.letter) {
      return NO_GENE;
    }

    const [, adnVariation] = parseGeneCode(chunk);
    const isVariation =
      !expectedVariation || expectedVariation === adnVariation;

    return isVariation ? chunk : NO_GENE;
  }
}
