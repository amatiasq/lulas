import { random } from '../math';
import Vector from '../vector';
import Cell from '../cell';
import Stat from '../stat';
import World from '../world';
import Game from './index';

export default class GameEntities {

    world: World;

    constructor(
        private game: Game,
        mapSize: Vector,
    ) {
        this.world = new World(mapSize);
    }

    addCell(position: Vector) {
        const cell = new Cell();

        cell.size = 4 + random(2);
        cell.pos = position;

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

        return cell;
    }

    getEntities() {
        return this.world.getAllEntities();
    }

    tickEntities() {
        const { world } = this;
        const entities = this.getEntities();

        for (const entity of entities) {
            if (entity instanceof Cell && !entity.isAlive) {
                world.remove(entity);
                continue;
            }

            entity.tick(world);
        }
    }

}