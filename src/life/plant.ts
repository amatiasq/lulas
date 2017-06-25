import WorldMap from '../map/map';
import Vector from '../physics/vector';
import { IRgbColor } from '../utils';
import Life from './life';


export default class Plant extends Life {

  static MAX_AREA = 100;
  static GROWTH = 0.05;
  static WEIGHT = 1;

  readonly baseColor: IRgbColor = { r: 0, g: 100, b: -1 };


  constructor(location: Vector, diameter: number, parents: Life[]) {
    super(location, diameter, parents);
    this.factor.weight = Plant.WEIGHT;
  }


  tick(map: WorldMap) {
    super.tick(map);

    if (this.area < Plant.MAX_AREA)
      this.diameter += Plant.GROWTH;
  }
}
