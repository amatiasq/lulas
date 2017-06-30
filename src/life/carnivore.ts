import Vector from '../physics/vector';
import { IRgbColor } from '../utils';
import Animal from './animal';
import Cell from './cell';
import Herbivore from './herbivore';
import Life from './life';

const DEBUG = false;


export default class Carnivore extends Cell {

  readonly baseColor: IRgbColor = { r: 255, g: 0, b: -1 };


  canFight(target: Life): boolean {
    return !(target instanceof Animal) || this.diameter > target.diameter;
  }


  _isFood(target: Life, currentPrey: Life) {
    const tmp = (result: boolean) => {
      if (DEBUG)
        console.log(this.id, target, currentPrey, result);

      return result;
    };

    if (target instanceof Herbivore)
      return tmp(true);

    if (currentPrey instanceof Herbivore)
      return tmp(false);

    return tmp(target instanceof Cell);
  }
}
