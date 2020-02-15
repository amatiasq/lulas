import { Cell } from '../Cell';
import { random } from '../math';
import { Stat } from '../Stat';
import { Vector } from '../Vector';
import { World } from '../World';
import { Game } from './Game';

export class GameEntities {
  readonly world: World;

  constructor(game: Game, mapSize: Vector) {
    this.world = new World(mapSize);
  }

  addCell(position: Vector) {
    const cell = new Cell();

    cell.size = 4 + random(2);
    cell.pos = position;

    this.setUpCell(cell);

    return cell;
  }

  reviveCell(id: number) {
    const cell = new Cell(id);

    this.setUpCell(cell);

    return cell;
  }

  private setUpCell(cell: Cell) {
    cell.setStat(Stat.ESCAPE_ACCELERATION, 1);
    cell.setStat(Stat.FRICTION, 0.3);
    cell.setStat(Stat.HUNT_ACCELERATION, 1);
    cell.setStat(Stat.MAX_BITE_SIZE, 10);
    cell.setStat(Stat.MAX_RADIUS, 200);
    cell.setStat(Stat.MAX_VELOCITY, 10);
    cell.setStat(Stat.MITOSIS_MIN_RADIUS, 50);
    cell.setStat(Stat.VISION_RANGE, 300);

    cell.flushState();

    this.world.add(cell);
  }

  getEntitiesAlive() {
    return this.world.getEntitiesAlive();
  }

  tickEntities() {
    const { world } = this;
    const entities = this.getEntitiesAlive();

    for (const entity of entities) {
      if (entity instanceof Cell && !(entity as Cell).isAlive) {
        world.remove(entity);
        continue;
      }

      entity.tick(world);
    }

    return entities;
  }
}
