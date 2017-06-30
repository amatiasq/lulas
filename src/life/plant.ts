import WorldMap from '../map/map';
import * as params from '../parameters';
import { IPhysicElementFactors } from '../physics/physic-element';
import Vector from '../physics/vector';
import { IRgbColor } from '../utils';
import Life from './life';


export default class Plant extends Life {
  factor: IPlantFactors;
  readonly baseColor: IRgbColor = { r: 0, g: 100, b: -1 };


  tick(map: WorldMap) {
    super.tick(map);

    if (this.area < this.factor.maxArea)
      this.diameter += this.factor.growth;
  }
}


export interface IPlantFactors extends IPhysicElementFactors {
  maxArea: number;
  growth: number;
}
