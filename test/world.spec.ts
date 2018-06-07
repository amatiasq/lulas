import World from '../src/world';
import Vector from '../src/vector';
import Cell from '../src/cell';

let world;

beforeEach(() => {
    world = new World(Vector.of(10, 10));
});

test('World returns no entities if empty', () => {
    const entities = world.getEntitiesAt(Vector.ZERO, 20);

    expect(entities).toHaveLength(0);
});

test('World returns single entity if in range', () => {
    const cell = new Cell();

    cell.pos = Vector.of(3, 3);
    world.add(cell);

    const entities = world.getEntitiesAt(Vector.ZERO, 5);

    expect(entities).toHaveLength(1);
    expect(entities[0]).toBe(cell);
})

test('World returns entity if entity is in border of radius', () => {
    const cell = new Cell();

    cell.pos = Vector.of(3, 0);
    world.add(cell);

    const entities = world.getEntitiesAt(Vector.ZERO, 3);

    expect(entities).toHaveLength(1);
    expect(entities[0]).toBe(cell);
});

test('World returns no entity if entity is outside radius', () => {
    const cell = new Cell();

    cell.pos = Vector.of(3, 3);
    world.add(cell);

    const entities = world.getEntitiesAt(Vector.ZERO, 3);

    expect(entities).toHaveLength(0);
});

test('World returns as many entities as visible', () => {
    const cells = [];

    for (let i = 0; i < 10; i++) {
        const cell = new Cell();
        cell.pos = Vector.of(i, i);
        cells.push(cell);
        world.add(cell);
    }

    const entities = world.getEntitiesAt(Vector.ZERO, 3);

    expect(entities).toHaveLength(3);
    expect(entities[0]).toBe(cells[0]);
    expect(entities[1]).toBe(cells[1]);
    expect(entities[2]).toBe(cells[2]);
});