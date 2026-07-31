import './matchers';
import Stat from '../src/stat';
import Cell from '../src/cell';
import Vector from '../src/vector';
import World from '../src/world';

test('A cell should be able to always see itself', () => {
    const sut = new Cell();
    sut.setStat(Stat.VISION_RANGE, 0);

    expect(sut.canSee(sut)).toBeTrue();
});

test('A cell should be able to see any cell in it\'s view range', () => {
    const { sut, target } = makeCellsAt([ 0, 0 ], [ 1, 0 ]);
    sut.setStat(Stat.VISION_RANGE, 1);

    expect(sut.canSee(target)).toBeTrue();
});

test('A cell should know when it\'s touching another cell', () => {
    const { sut, target } = makeCellsAt([ 0, 0 ], [ 1, 0 ]);

    expect(sut.isTouching(target)).toBeTrue();
});

test('A cell is touching another one if there is no space between them', () => {
    const { sut, target } = makeCellsAt([ 0, 0 ], [ 2, 0 ]);

    expect(sut.isTouching(target)).toBeTrue();
});

test('A cell should know when another cell is bigger', () => {
    const { sut, target } = makeCellsSize(1, 2);

    expect(sut.considerFight(target)).toBe(-1);
});

test('A cell should know when another cell is smaller', () => {
    const { sut, target } = makeCellsSize(2, 1);

    expect(sut.considerFight(target)).toBe(1);
});

test('A cell should know when another cell is the same size', () => {
    const { sut, target } = makeCellsSize(1, 1);

    expect(sut.considerFight(target)).toBe(0);
});

test('A cell should detect another cell if it\'s in contact even with vision range 0', () => {
    const { sut, target } = makeCellsAt([ 0, 0 ], [ 0, 2 ]);

    sut.setStat(Stat.VISION_RANGE, 0);

    expect(sut.canSee(target)).toBeTrue();
});

test('A cell should see another cell if it\'s limits are inside it\'s vision range', () => {
    const { sut, target } = makeCellsAt([ 0, 0 ], [ 10, 0 ]);

    sut.setStat(Stat.VISION_RANGE, 5);
    sut.size = 2.5;
    target.size = 2.5;

    sut.flushState();
    target.flushState();

    expect(sut.canSee(target)).toBeTrue();
});

test('A cell should see all cells returned by .getVisibleEntities() and no other', () => {
    const WORLD_SIZE = Vector.of(10, 10);
    const world = new World(WORLD_SIZE);
    const sut = new Cell();

    sut.pos = Vector.of(5, 5)
    sut.size = 0.5;
    sut.setStat(Stat.VISION_RANGE, 3);
    sut.flushState();
    world.add(sut);

    const others = [];

    for (const vector of Vector.iterate(Vector.ZERO, WORLD_SIZE)) {
        const cell = new Cell();

        cell.pos = vector;
        cell.size = 0.5;
        cell.flushState();

        others.push(cell);
        world.add(cell);
    }

    const visible = sut.getVisibleEntities(world);

    for (const cell of others) {
        if (sut.canSee(cell)) {
            expect(visible).toContain(cell);
        } else {
            expect(visible).not.toContain(cell);
        }
    }
});

function makeCellsSize(sutSize, targetSize) {
    const sut = new Cell();
    const target = new Cell();

    sut.size = sutSize;
    target.size = targetSize;

    sut.flushState();
    target.flushState();

    return { sut, target };
}

function makeCellsAt([ sutX, sutY ], [ targetX, targetY ]) {
    const { sut, target } = makeCellsSize(1, 1);

    sut.pos = Vector.of(sutX, sutY);
    target.pos = Vector.of(targetX, targetY);

    sut.flushState();
    target.flushState();

    return { sut, target };
}