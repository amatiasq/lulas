/*
import Circle from '../map/circle';
import PhysicElement from '../physics/physic-element';
import Vector from '../physics/vector';


const DEBUG = false;


export interface ILife extends Circle, PhysicElement {
  move(): void;
}


export default class Life implements ILife {
  private parents: Set<number>;
  private _isAlive = true;
  private id: number;
  onDie: (self: this) => void;


  // Interface implementation
  move: () => void;


  constructor(location: Vector, diameter: number, parents: Life[]) {
    const { id } = this;
    Circle.call(this, location, diameter);
    PhysicElement.call(this);

    if (DEBUG) {
      if (id)
        console.log(id, 'reencarnated into', this.id);
      else
        console.log(this.id, 'HAS BORN AS', this.constructor.name);
    }

    this.parents = new Set(parents.map(parent => parent.id));
  }


  get isAlive() {
    return this._isAlive;
  }
  get isDead() {
    return !this._isAlive;
  }


  dispose() {
    if (DEBUG)
      console.log(this.id, 'IS DEAD');

    Circle.prototype.dispose.call(this);
    PhysicElement.prototype.dispose.call(this);
    this.parents = null;
  }

  tick() {
    if (this.isDead)
      throw new Error('Dead life form can\'t tick');

    this.move();
  }

  die() {
    if (this.isDead)
      return;

    if (this.onDie)
      this.onDie(this);

    this._isAlive = false;
  }

  isParent(target: Life) {
    return target.parents.has(this.id);
  }

  isSibiling(target: Life) {
    for (const id of this.parents)
      if (target.parents.has(id))
        return true;
  }

  isFamily(target: Life) {
    return target.isParent(this) ||
      this.isParent(target) ||
      this.isSibiling(target);
  }
}


Object.defineProperties(Life.prototype, {
  ...getOwnPropertyDescriptors(Circle.prototype),
  ...getOwnPropertyDescriptors(PhysicElement.prototype),
  ...getOwnPropertyDescriptors(Life.prototype),
});


function getOwnPropertyDescriptors(object: object) {
  const result: IPropertyDescriptors = {};

  return Reflect.ownKeys(object).reduce((descriptors, key) => {
    descriptors[key] = Object.getOwnPropertyDescriptor(object, key);
    return descriptors;
  }, result);
}

interface IPropertyDescriptors {
  [id: string]: PropertyDescriptor;
}
*/
