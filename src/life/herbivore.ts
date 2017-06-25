import { IRgbColor } from '../utils';
import Cell from './cell';
import Life from './life';
import Plant from './plant';


export default class Herbivore extends Cell {

  readonly baseColor: IRgbColor = { r: 100, g: 255, b: -1 };


  _isFood(target: Life) {
    return target instanceof Plant;
  }
}
