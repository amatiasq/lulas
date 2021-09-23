export type Gene = string;

export function getDominantGene(gen1: Gene, gen2: Gene) {
  // [d,D][A,B,C,D,..][0,1,2,3]gensequencehere
  // D < d
  return gen1[0] <= gen2[0] ? gen1 : gen2;
}

export class Chromosome {
  constructor(readonly genes: Gene[]) {}

  getBool(codes: string[]) {
    const string = this.getGeneticCode(codes);
    return hashReduce(string, 0, 100) > 50;
  }

  getNumber(codes: string[], min: number, max: number) {
    const string = this.getGeneticCode(codes);
    return hashReduce(string, min, max);
  }

  private getGeneticCode(codes: string[]) {
    return codes.map(x => this.getGeneFrom(x)).join('');
  }

  private getGeneFrom(code: string) {
    const gen = this.genes.find(x => x[1] === code[0]);
    const isJustLetter = gen && code.length === 1;
    const isSameVariant = gen && gen[2] === code[1];
    return isJustLetter || isSameVariant ? gen : '';
  }
}

function hashReduce(hash: string, min: number = 0, max: number = 100) {
  let b = 0;

  for (let i = 0; i < hash.length; i++) {
    b += hash.charCodeAt(i);
  }

  b = b % max;

  return Math.max(b, min);
}
