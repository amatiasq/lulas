import Physics from '../physics/physic-element';
import Vector from '../physics/vector';
import { IRgbColor } from '../utils';


export default class Circle extends Physics {
  readonly baseColor: IRgbColor = { r: -1, g: -1, b: -1 };
  color: string;
  radius: number;


  constructor(public location = Vector.ZERO, diameter = 1) {
    super();
    this.diameter = diameter;
  }


  get x() {
    return this.location.x;
  }
  set x(value) {
    this.location = new Vector(value, this.location.y);
  }
  get y() {
    return this.location.y;
  }
  set y(value) {
    this.location = new Vector(this.location.x, value);
  }

  get startX() {
    return this.location.x - this.radius;
  }
  get startY() {
    return this.location.y - this.radius;
  }
  get endX() {
    return this.location.x - this.radius;
  }
  get endY() {
    return this.location.y - this.radius;
  }

  get diameter() {
    return this.radius * 2;
  }
  set diameter(value) {
    this.radius = value / 2;
  }
  get area() {
    return Math.PI * this.radius * this.radius;
  }


  move() {
    this.location = this.location.add(this.movement);
  }


  dispose() {
    super.dispose();
    this.location = null;
  }

  aimTo(target: Circle): Vector {
    return target.location.sustract(this.location);
  }

  angle(target: Circle): number {
    return this.aimTo(target).degrees;
  }

  distance(target: Circle): number {
    return this.aimTo(target).magnitude;
  }

  testCollision(target: Circle): boolean {
    return this.distance(target) < this.radius + target.radius;
  }
}
