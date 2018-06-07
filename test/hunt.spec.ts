import './matchers';
import Stats  from '../src/stat';
import Vector  from '../src/vector';
import World  from '../src/world';
import Cell  from '../src/cell';

let world, prey, hunter;

beforeEach(() => {
    world = new World(Vector.of(10, 10));
    hunter = new Cell();
    prey = new Cell();

    hunter.pos = Vector.of(2, 2);
    hunter.velocity = Vector.of(0, 0);
    prey.pos = Vector.of(8, 8);

    hunter.setDietType(Cell);
    world.add(hunter);
    world.add(prey);
});

test('Hunter sees prey', () => {
    hunter.setStat(Stats.VISION_RANGE, 20);

    expect(hunter.canSee(prey)).toBeTrue();
});

test('Hunter moves torwards prey', () => {
    hunter.setStat(Stats.MAX_RADIUS, 100);
    hunter.setStat(Stats.VISION_RANGE, 20);
    hunter.setStat(Stats.HUNT_ACCELERATION, 1);

    hunter.tick(world);

    expect(hunter.velocity.x).toBeGreaterThan(0);
    expect(hunter.velocity.y).toBeGreaterThan(0);
});

test('Hunter eats prey on contact', () => {
    const spy = jest.fn();
    hunter.on('eat', spy);
    hunter.pos = prey.pos;
    hunter.setStat(Stats.VISION_RANGE, 10);

    expect(hunter.isTouching(prey)).toBeTrue();

    hunter.tick(world);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(prey);
});

test('Hunter doesn\'t see prey out of range', () => {
    hunter.setStat(Stats.VISION_RANGE, 1);

    expect(hunter.canSee(prey)).toBeFalse();
});

test('Hunter doesn\'t move if prey is out of range', () => {
    hunter.setStat(Stats.VISION_RANGE, 1);

    hunter.tick(world);

    expect(hunter.velocity.is(0)).toBeTrue();
});

test('Hunter doesn\'t eat prey even if close by', () => {
    const spy = jest.fn();
    hunter.on('eat', spy);
    hunter.setStat(Stats.VISION_RANGE, 1);
    hunter.size = 1;
    prey.size = 1;
    prey.pos = Vector.of(4, 4.1);

    expect(hunter.isTouching(prey)).toBeFalse();

    hunter.tick(world);

    expect(spy).not.toHaveBeenCalled();
});
