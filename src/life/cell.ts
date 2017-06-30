import Vector from '../physics/vector';
import Animal, { IAnimalFactors } from './animal';
import Life from './life';


export default class Cell extends Animal {

  factor: ICellFactor;


  canReproduce() {
    return this.radius > this.factor.maxSize;
  }


  reproduce() {
    const children = [];
    const generatedSize = this.radius * this.factor.mitosisGrowth;
    const childrenCount = Math.ceil(generatedSize / this.factor.mitosisMaxSize);
    const childrenSize = generatedSize / childrenCount;
    const degreeChange = 360 / childrenCount;
    const parents = [ this ];

    for (let i = 0; i < childrenCount; i++) {
      const child = this.createChild(this.location, childrenSize, parents);
      children.push(child);
      child.shove(Vector.from(degreeChange * i, this.factor.mitosisSplitVelocity));
    }

    if (this.onReproduce)
      this.onReproduce(children, this);

    this.die();
    return children;
  }


  protected createChild(location: Vector, radius: number, parents: Cell[]) {
    const ctor = this.constructor as ICellCreator;
    return new ctor(location, radius, parents);
  }
}


export interface ICellFactor extends IAnimalFactors {
  maxSize: number;
  mitosisSplitVelocity: number;
  mitosisGrowth: number;
  mitosisMaxSize: number;
}


interface ICellCreator {
  new(location: Vector, radius: number, parents: Cell[]): Cell;
}
