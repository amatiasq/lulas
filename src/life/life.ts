import Circle from '../map/circle';
import WorldMap from '../map/map';
import PhysicElement from '../physics/physic-element';
import Vector from '../physics/vector';


const DEBUG = false;
let id = 0;


export default class Life extends Circle {
  private parents: Set<number>;
  private _isAlive = true;
  protected id: number;

  onDie: (self: this) => void;
  onReproduce: (children: Life[], self: this) => void;
  $entityType: string;


  constructor(location: Vector, diameter: number, parents: Life[]) {
    super(location, diameter);
    const { id: oldId } = this;
    this.id = id++;

    if (DEBUG) {
      if (oldId)
        console.log(oldId, 'reencarnated into', this.id);
      else
        console.log(this.id, 'HAS BORN AS', this.constructor.name);
    }

    this.parents = new Set(parents ? parents.map(parent => parent.id) : null);
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

    super.dispose();
    this.parents = null;
  }

  tick(map: WorldMap) {
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


  isFood(target: Life, currentPrey: Life = null) {
    if (this === target || this.isFamily(target))
      return false;

    return this._isFood(target, currentPrey);
  }

  protected _isFood(target: Life, currentPrey: Life) {
    return false;
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
