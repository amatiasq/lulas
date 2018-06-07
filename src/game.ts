import Cell from "./cell.js";
import Stat from "./stat.js";
import Vector from "./vector.js";
import World from "./world.js";

export default class Game {

    private world: World;

    constructor(
        private canvas: HTMLCanvasElement,
        mapSize: Vector,
    ) {
        this.world = new World(mapSize);
    }

    addCell(position: Vector) {
        const cell = new Cell();
        cell.pos = position;
        this.world.add(cell);

        cell.setStat(Stat.HUNT_ACCELERATION, 1);
        cell.setStat(Stat.MAX_BITE_SIZE, 10);
        cell.setStat(Stat.MAX_RADIUS, 200);
        cell.setStat(Stat.MITOSIS_MIN_RADIUS, 50);
        cell.setStat(Stat.VISION_RANGE, 500);

        return cell;
    }

    getEntities() {
        return this.world.getAllEntities();
    }

    tick() {
        const { world } = this;
        const entities = world.getAllEntities();

        for (const entity of entities) {
            entity.tick(world);
        }

        const { width, height } = this.canvas;
        const context = this.canvas.getContext("2d");

        context.clearRect(0, 0, width, height);

        for (const entity of entities) {
            entity.render(context);
        }
    }

}
