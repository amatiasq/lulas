import Stat from '../stat';
import World from '../world';
import Cell from './index';

export default class CellSenses {

    constructor(
        private cell: Cell,
    ) {}

    getVisibleEntities(map: World) {
        const visionRange = this.cell.getStat(Stat.VISION_RANGE);
        const entities = map.getEntitiesAt(this.cell.pos, visionRange);

        return entities.filter((entry) => entry !== this.cell);
    }

    canSee(target: Cell) {
        const distance = this.cell.pos.distance(target.pos);
        const visionRange = this.cell.getStat(Stat.VISION_RANGE);

        return distance <= visionRange;
    }

    isTouching(target: Cell) {
        const distance = this.cell.pos.distance(target.pos);
        const minDistance = this.cell.size + target.size;

        return distance <= minDistance;
    }

    considerFight(target: Cell) {
        return this.cell.size - target.size;
    }

}
