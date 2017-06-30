import { applyFactors } from '../utils';
import Vector, { MutableVector } from './vector';


export default abstract class PhysicElement {
  private _isDisposed = false;
  movement = Vector.ZERO;
  factor: IPhysicElementFactors;


  constructor() {
    applyFactors(this);
  }


  get direction() {
    return this.movement.degrees;
  }
  set direction(value: number) {
    this.movement = Vector.from(value, this.movement.magnitude);
  }
  get velocity() {
    return this.movement.magnitude;
  }
  set velocity(value) {
    this.movement = Vector.from(this.movement.degrees, value);
  }

  get isStopped() {
    return Math.round(this.velocity * 10) === 0;
  }
  get isMoving() {
    return !this.isStopped;
  }
  get isDisposed() {
    return this._isDisposed;
  }


  dispose() {
    this._isDisposed = true;
    this.movement = null;
    this.factor = null;
  }

  abstract move(): void;

  shove(force: Vector): void {
    if (this.factor.weight)
      force = Vector.from(force.degrees, force.magnitude * (1 - this.factor.weight));

    this.movement = this.movement.add(force);
  }

  accelerate(force: number) {
    this.velocity += force;
  }

  brake(force: number) {
    let velocity = this.velocity - force;

    if (velocity < 0)
      velocity = 0;

    this.velocity = velocity;
  }

  stop() {
    this.velocity = 0;
  }
}


export interface IPhysicElementFactors {
  weight: number;
}
