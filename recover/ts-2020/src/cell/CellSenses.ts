import { Stat } from '../Stat';
import { World } from '../World';
import { Cell } from './Cell';

export class CellSenses {
  constructor(private readonly cell: Cell) {}

  getVisionRange() {
    return this.cell.size + this.cell.getStat(Stat.VISION_RANGE);
  }

  getVisibleEntities(map: World) {
    const visionRange = this.getVisionRange();
    const entities = map.getEntitiesIn(this.cell.pos, visionRange);

    return entities.filter(entry => entry !== this.cell);
  }

  canSee(target: Cell) {
    const visionRange = this.getVisionRange();
    const distance = this.cell.pos.distance(target.pos);

    return distance <= visionRange + target.size;
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
