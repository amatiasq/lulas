import Circle from '../map/circle';
import WorldMap from '../map/map';
import * as params from '../parameters';
import { IPhysicElementFactors } from '../physics/physic-element';
import Vector from '../physics/vector';
import Life from './life';


const DEBUG = false;
const PREY = 'prey';
const PREY_DISTANCE = 'prey-distance';
const PREDATOR = 'predator';
const PREDATOR_DISTANCE = 'predator-distance';


export default abstract class Animal extends Life {
  factor: IAnimalFactors;
  isBored: boolean;


  abstract canReproduce(): boolean;
  abstract reproduce(): Animal[];


  tick(map?: WorldMap) {
    super.tick(map);

    this.radius -= this.factor.consumption / 2;

    if (this.radius <= 0)
      return this.die();

    if (this.canReproduce())
      return this.reproduce();

    this.interact(map);
  }


  areSameSpecies(target: Life) {
    return Object.getPrototypeOf(target) === Object.getPrototypeOf(this);
  }


  interact(map: WorldMap) {
    const attention: IAttention = new Map();
    const neighbors = map.getEntitiesAt(this.location, this.radius * this.factor.visibility);

    for (let i = neighbors.length; i--; )
      if (neighbors[i] !== this)
        this.seeObject(neighbors[i] as Life, map, attention);

    if (DEBUG)
      console.log(this.id, 'sees', neighbors.length);

    this.isBored = !attention.has(PREY) && !attention.has(PREDATOR);
    if (this.isBored)
      return;

    const prey = attention.get(PREY_DISTANCE) as Vector;
    const predator = attention.get(PREDATOR_DISTANCE) as Vector;

    const force = prey ?
      Vector.from(prey.degrees, this.factor.velocityHunting / prey.magnitude ) :
      Vector.from(predator.degrees + 180, this.factor.velocityEscaping / predator.magnitude);

    this.shove(force.multiplyValue(this.factor.velocity));
  }

  seeObject(target: Life, map: WorldMap, attention: IAttention) {
    const distance = map.getShorterDistance(this.location, target.location);
    const currentPrey = attention.get(PREY) as Life;

    if (this.isPredator(target) && this.escape(target as Animal, distance, attention)) {
      attention.set(PREDATOR, target);
      attention.set(PREDATOR_DISTANCE, distance);
    }

    if (this.isFood(target, currentPrey) && this.hunt(target, distance, attention)) {
      attention.set(PREY, target);
      attention.set(PREY_DISTANCE, distance);
    }
  }

  isPredator(target: Life): boolean {
    return target.isFood(this);
  }

  escape(predator: Animal, distance: Vector, attention: IAttention): boolean {
    if (!predator.canFight(this))
      return false;

    const currentPredatorDistance = attention.get(PREDATOR_DISTANCE) as Vector;

    if (!currentPredatorDistance)
      return true;

    return distance.magnitude < currentPredatorDistance.magnitude;
  }

  hunt(prey: Life, distance: Vector, attention: IAttention): boolean {
    if (!this.canFight(prey))
      return false;

    const currentPreyDistance = attention.get(PREY_DISTANCE) as Vector;

    if (currentPreyDistance && distance.magnitude >= currentPreyDistance.magnitude)
      return false;

    if (this.testCollision(prey))
      this.eat(prey);

    return true;
  }

  canFight(target: Life): boolean {
    return true;
  }

  eat(prey: Life) {
    const maxFood = Math.min(this.diameter * this.factor.maxBite, prey.diameter);
    this.diameter += maxFood;
    prey.diameter -= maxFood;

    if (prey.diameter > 0)
      return;

    prey.die();

    const before = this.direction;
    const after = this.direction = Math.random() * 360;
    this.velocity *= 10;
  }

  move() {
    this.velocity *= 1 - this.factor.friction;

    if (this.velocity > this.factor.maxVelocity)
      this.velocity = this.factor.maxVelocity;

    super.move();
  }
}


export interface IAnimalFactors extends IPhysicElementFactors {
  consumption: number;
  friction: number;
  maxBite: number;
  maxVelocity: number;
  velocity: number;
  velocityHunting: number;
  velocityEscaping: number;
  visibility: number;
}


type IAttention = Map<string, Life | Vector>;
