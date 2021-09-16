import { Dsl } from './DslDefinition';
import { arrayToObject } from './util';

const dsl = new Dsl(`
  canReproduce = bool(AB1C)
  velocity = A27 ? A27 * 0.2 : B * 0.1
  turnSpeed = cap(AC, 0, 100)
`);

const adn = ['A27B2C3', 'A01C3', ''];

console.log(arrayToObject(adn, x => dsl.apply(x)));
