import Circle from './map/circle';
import * as params from './parameters';
import PhysicElement from './physics/physic-element';


export interface IRgbColor {
  r: number;
  g: number;
  b: number;
}


export interface IRenderer {
  width: number;
  height: number;

  append(parent: Element): void;
  remove(): void;
  clear(): void;

  drawEntity(entity: Circle): void;
}


// Typescript doesn't support symbols in iterfaces
// Const defaultFactors = Symbol('default-factors');

// This is a fucking function you idiot!
// tslint:disable-next-line:ban-types
type FactorClass = Function & { __defaultFactors: IFactor };
interface IFactor {
  [id: string]: number;
}

export function applyFactors(self: PhysicElement) {
  // This function does metaprogramming so we need to skip types for this two variables
  // tslint:disable-next-line:no-any
  const instance = self as any as { factor: IFactor };
  // tslint:disable-next-line:no-any
  const conf = params as any as IFactor;
  const klass = self.constructor as FactorClass;
  const type = klass.name;

  if (klass.hasOwnProperty('__defaultFactors')) {
    instance.factor = Object.assign({}, klass.__defaultFactors);
    return;
  }

  // Firsts elements are Object.prototype and Function
  const heritage = getPrototypeChain(klass).slice(2) as FactorClass[];
  const factors: IFactor = {};

  heritage.forEach(parent => {
    if (parent.hasOwnProperty('__defaultFactors')) {
      Object.assign(factors, parent.__defaultFactors);
      return;
    }

    const prefix = `FACTOR_${pascalCaseToUpperCase(parent.name)}_`;
    const keys = Object.keys(params)
      .filter(key => key.indexOf(prefix) === 0)
      .map(key => key.substr(prefix.length));

    keys.forEach(key => {
      console.log(`Setting ${prefix}${key} to ${conf[prefix + key]} in ${parent.name} for ${type}`);
      factors[upperCaseToCamelCase(key)] = conf[prefix + key];
    });
    parent.__defaultFactors = Object.assign({}, factors);
  });

  instance.factor = factors;
}


function getPrototypeChain(target: object): object[] {
  const chain = [] as object[];
  let proto = target;

  do {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto) as object;
  } while (proto);

  return chain.reverse();
}


function upperCaseToCamelCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_\w/g, key => key[1].toUpperCase());
}


function camelCaseToUpperCase(value: string) {
  return value
    .replace(/[A-Z]/g, key => '_' + key)
    .toUpperCase();
}

function pascalCaseToUpperCase(value: string) {
  return camelCaseToUpperCase(value).substr(1);
}
