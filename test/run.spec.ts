import './matchers';
import World from '../src/world';
import Cell from '../src/cell';
import Vector from '../src/vector';
import Stat from '../src/stat';

const WORLD_SIZE = Vector.of(10, 10);
const WORLD_CENTER = Vector.of(5, 5);

for (const vector of Vector.iterate(WORLD_SIZE)) {
    test(`Prey sees predator at ${vector}`, () => {
        const { prey, predator } = makeWorld(WORLD_CENTER, vector);
        prey.setStat(Stat.VISION_RANGE, 20);
        expect(prey.canSee(predator)).toBeTrue();
    });

    if (!vector.is(WORLD_CENTER)) {
        test(`Prey doesn't see predator out of range at ${vector}`, () => {
            const { prey, predator } = makeWorld(WORLD_CENTER, vector)

            prey.size = 0.3;
            prey.setStat(Stat.VISION_RANGE, 0.1);

            expect(prey.canSee(predator)).toBeFalse();
        });

        test(`Prey moves away of predator at ${vector}`, () => {
            const { prey, predator, world } = makeWorld(WORLD_CENTER, vector)
            const direction = predator.pos.sub(prey.pos);

            prey.setStat(Stat.FRICTION, 0);
            prey.setStat(Stat.MAX_RADIUS, 100);
            prey.setStat(Stat.VISION_RANGE, 20);
            prey.setStat(Stat.ESCAPE_ACCELERATION, 1);

            prey.tick(world);

            const { x, y } = prey.velocity;

            if (direction.x) {
                expect(x).toBeBetween(0, direction.x);
            }

            if (direction.y) {
                expect(y).toBeBetween(0, direction.y);
            }
        })
    }
}

function makeWorld({ x: preyX, y: preyY }, { x: predatorX, y: predatorY }) {
    const world = new World(WORLD_SIZE);
    const predator = new Cell();
    const prey = new Cell();

    predator.pos = Vector.of(predatorX, predatorY);
    predator.size = 0.5;

    prey.velocity = Vector.of(0, 0);
    prey.pos = Vector.of(preyX, preyY);
    prey.size = 0.4;

    predator.setDietType(Cell);
    world.add(predator);
    world.add(prey);

    return { predator, prey, world };
}
