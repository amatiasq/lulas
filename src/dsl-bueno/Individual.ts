import { Chromosome, Gene, getDominantGene } from './Chromosome';
import { randomBool, randomItem } from './util';

export class Individual {
  static fromRandom(genes: Gene[][]) {
    return new Individual([
      new Chromosome(genes.map(randomItem)),
      new Chromosome(genes.map(randomItem)),
    ]);
  }

  static fromParents(i1: Individual, i2: Individual) {
    return new Individual([
      new Chromosome(i1.makeGamete()),
      new Chromosome(i2.makeGamete()),
    ]);
  }

  constructor(readonly chromosomes: [Chromosome, Chromosome]) {}

  makeGamete() {
    return this.each((a, b) => (randomBool() ? a : b));
  }

  getGeneticPhoto() {
    return new Chromosome(this.each(getDominantGene));
  }

  private each(mapper: (a: Gene, b: Gene) => Gene) {
    const [{ genes: c1 }, { genes: c2 }] = this.chromosomes;
    return c1.map((g1, i) => mapper(g1, c2[i]));
  }
}
