import { Stat } from '../Stat';
import { Cell } from './Cell';

export class CellDiet {
  private readonly types = new Map<IEnergySourceConstructor, number>();

  constructor(private readonly cell: Cell) {}

  addType(Type: IEnergySourceConstructor, weight: number) {
    this.types.set(Type, weight);
  }

  eat(target: IEnergySource) {
    if (!this.cell.canEat(target)) {
      throw new Error(`Invalid food source: ${target}`);
    }

    const selfEnergy = this.cell.energy;
    const targetEnergy = target.energy;
    const nutrition = this.consider(target);
    const maxBitePercent = this.cell.getStat(Stat.MAX_BITE_SIZE);
    const maxBite = selfEnergy * maxBitePercent;
    const bite = targetEnergy > maxBite ? maxBite : targetEnergy;

    target.energy -= bite;
    this.cell.energy += bite * nutrition;
    this.cell.emit('eat', target);

    return true;
  }

  consider(target: IEnergySource) {
    const Type = target.constructor as IEnergySourceConstructor;

    return this.types.get(Type) || 0;
  }
}

export interface IEnergySource {
  energy: number;
}

export interface IEnergySourceConstructor {
  new (): IEnergySource;
}
