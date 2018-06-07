import './matchers';
import Stats  from '../src/stat';
import Vector  from '../src/vector';
import World  from '../src/world';
import Cell  from '../src/cell';

let world, sut, parent, sibling, child;

beforeEach(() => {
    sut = new Cell();
    parent = new Cell();
    sibling = new Cell();

    sut.setParent(parent);
    sibling.setParent(parent);
});

test('A child recognizes it\'s parent', () => {
    expect(sut.isChildOf(parent)).toBeTrue();
});

test('A parent recognizes it\'s child', () => {
    expect(parent.isParentOf(sut)).toBeTrue();
});

test('Siblings recognize each other', () => {
    expect(sut.isSibling(sibling)).toBeTrue();
});

test('Family don\'t eat each other', () => {
    parent.setDietType(Cell);
    sut.setDietType(Cell);
    sibling.setDietType(Cell);

    expect(sut.canEat(parent)).toBeFalse();
    expect(sut.canEat(sibling)).toBeFalse();
    expect(parent.canEat(sut)).toBeFalse();
    expect(parent.canEat(sibling)).toBeFalse();
    expect(sibling.canEat(parent)).toBeFalse();
    expect(sibling.canEat(sut)).toBeFalse();
});

test('When a cell undergoes mitosis it creates two or more siblings', () => {
    const spy = jest.fn();
    sut.on('mitos', spy);
    sut.size = 3;
    sut.setStat(Stats.MITOSIS_MIN_RADIUS, 2);

    expect(sut.canMitos()).toBeTrue();

    const children = sut.mitos();
    const [ firstChild, secondChild ] = children;

    expect(children.length).toBeGreaterThanOrEqual(2);
    expect(firstChild.isSibling(secondChild)).toBeTrue();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(children);
});

// test('When a cell undergoes mitosis it\'s children inherit it\'s listeners', () => {
//     const spy = jest.fn();
//     sut.on('die', spy);

//     const [ firstChild ] = sut.mitos();
//     sut.inheritListeners(firstChild);
//     firstChild.die();

//     expect(spy).toHaveBeenCalledTimes(2);
//     expect(spy).toHaveBeenCalledWith(sut);
//     expect(spy).toHaveBeenCalledWith(firstChild);
// });
