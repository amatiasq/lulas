import { DslProperty } from './DslProperty';
import { Genome } from './Genome';
import { arrayToObject, uniq } from './util';

export class Dsl {
  readonly properties: DslProperty[];
  readonly genome: Genome;
  readonly genes: string[];
  private readonly genePatterns: string[];

  constructor(readonly code: string) {
    this.properties = code
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
      .map(DslProperty.parse);

    this.genes = uniq(this.properties.flatMap(x => x.genes));
    this.genePatterns = uniq(this.properties.flatMap(x => x.patterns));

    this.genome = new Genome(this.genes);
  }

  apply(adn: string) {
    const { genome } = this;

    const target: Record<string, number | boolean> = {};
    const variables = {
      ...arrayToObject(this.genes, x => genome.get(adn, x)),
      ...arrayToObject(this.genePatterns, x => genome.getPattern(adn, x)),
    };

    for (const prop of this.properties) {
      prop.apply(target, variables);
    }

    return target;
  }
}
