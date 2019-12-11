import './matchers';

import { Cell } from '../src/Cell';
import { Stat } from '../src/Stat';

test("A child recognizes it's parent", () => {
  const { sut, parent } = makeFamily();

  expect(sut.isChildOf(parent)).toBeTrue();
});

test("A parent recognizes it's child", () => {
  const { sut, parent } = makeFamily();

  expect(parent.isParentOf(sut)).toBeTrue();
});

test('Siblings recognize each other', () => {
  const { sut, sibling } = makeFamily();

  expect(sut.isSibling(sibling)).toBeTrue();
});

test("Family don't eat each other", () => {
  const { sut, parent, sibling } = makeFamily();

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
  const sut = new Cell();
  const spy = jest.fn();

  sut.size = 3;
  sut.on('mitos', spy);
  sut.setStat(Stat.MITOSIS_MIN_RADIUS, 2);
  sut.flushState();

  expect(sut.canMitos()).toBeTrue();

  const children = sut.mitos();
  const [firstChild, secondChild] = children;

  expect(children.length).toBeGreaterThanOrEqual(2);
  expect(firstChild.isSibling(secondChild)).toBeTrue();

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(children);
});

test("When a cell undergoes mitosis the energy of all childen sum the parent's energy", () => {
  const sut = new Cell();

  sut.size = 3;
  sut.setStat(Stat.MITOSIS_MIN_RADIUS, 2);
  sut.flushState();

  const { energy } = sut;

  expect(sut.canMitos()).toBeTrue();

  const children = sut.mitos();
  let childrenEnergy = 0;

  for (const child of children) {
    child.flushState();
    childrenEnergy += child.energy;
  }

  expect(childrenEnergy).toBeAprox(energy);
});

test('A cell must die when undergoes mitosis', () => {
  const sut = new Cell();
  const spy = jest.fn();

  sut.size = 3;
  sut.setStat(Stat.MITOSIS_MIN_RADIUS, 2);
  sut.on('die', spy);

  sut.flushState();
  expect(sut.canMitos()).toBeTrue();

  sut.mitos();
  sut.flushState();

  expect(sut.isAlive).toBeFalse();
  expect(spy).toHaveBeenCalledTimes(1);
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

function makeFamily() {
  const sut = new Cell();
  const parent = new Cell();
  const sibling = new Cell();

  sut.setParent(parent);
  sibling.setParent(parent);

  return { sut, parent, sibling };
}
