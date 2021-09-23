import { computeDsl, DslDefinition } from './dsl';
import { Individual } from './Individual';
import { arrayOf } from './util';

const geneDefinition = [
  ['DA1dsaDF0', 'dA2dffds1'],
  ['DB1dfdafbv', 'dB2dfsaf23', 'DB3avbgh44'],
  ['DC1dfas456', 'dC2fadf963'],
  ['dD1fadsfas', 'DD2324jk23'],
];

const dslDefinition: DslDefinition = {
  canReproduce: 'B A1',
  velocity: 'N 10,100 C D A2 B14',
  turnSpeed: 'N -10,10 A B2 C1 D',
};

arrayOf(25, () => {
  const [i1, i2] = arrayOf(2, () => Individual.fromRandom(geneDefinition));
  const child = Individual.fromParents(i1, i2);
  const photo = child.getGeneticPhoto();
  console.log(computeDsl(photo, dslDefinition));
});
