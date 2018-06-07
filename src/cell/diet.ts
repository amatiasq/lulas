import Stat from '../stat';
import Cell from './index';

export default class CellDiet {

    private types = new Map<IEnergySourceConstructor, number>();

    constructor(
        private cell: Cell,
    ) {}

    addType(Type: IEnergySourceConstructor, weight: number) {
        this.types.set(Type, weight);
    }

    eat(target: IEnergySource) {
        if (!this.canEat(target)) {
            throw new Error(`Invalid food source: ${target}`);
        }

        const nutrition = this.consider(target);
        const maxBite = this.cell.getStat(Stat.MAX_BITE_SIZE);
        const { energy } = target;
        const bite = energy > maxBite ? maxBite : energy;

        target.energy -= bite;
        this.cell.energy += bite * nutrition;
        this.cell.emit('eat', target);

        return true;
    }

    canEat(target: IEnergySource) {
        return this.consider(target) > 0;
    }

    consider(target: IEnergySource) {
        return this.types.get(target.constructor as IEnergySourceConstructor) || 0;
    }

}

export interface IEnergySource {
    energy: number;
}

export interface IEnergySourceConstructor {
    new (): IEnergySource;
}
