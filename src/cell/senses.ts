import Stat from '../stat';
import World from '../world';
import Cell from './index';

export default class CellSenses {

    constructor(
        private cell: Cell,
    ) {}

    getVisionRange() {
        return this.cell.size + this.cell.getStat(Stat.VISION_RANGE);
    }

    getVisibleEntities(map: World) {
        // TODO: Use getVisionRange();
        const visionRange = this.cell.getStat(Stat.VISION_RANGE);
        const entities = map.getEntitiesIn(this.cell.pos, visionRange);

        return entities.filter((entry) => entry !== this.cell);
    }

    canSee(target: Cell) {
        const borders = this.cell.size + target.size;
        const distance = this.cell.pos.distance(target.pos);
        const visionRange = this.cell.getStat(Stat.VISION_RANGE);

        return distance - borders <= visionRange;
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
