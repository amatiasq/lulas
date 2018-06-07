import './matchers';
import Cell from '../src/cell';
import Stat from '../src/stat';

class Dummy {
    energy = 1;
}

test('A cell should accept a list of valid diet', () => {
    const sut = new Cell();
    const target = new Dummy();

    expect(sut.canEat(target)).toBe(false);

    sut.setDietType(Dummy, 1);

    expect(sut.canEat(target)).toBe(true);
});

test('A cell should estimate how nutricious a given food is', () => {
    const sut = new Cell();
    const target = new Dummy();

    sut.setDietType(Dummy, 0.5);

    expect(sut.considerFood(target)).toBe(0.5);
});

test('A cell should take in account how much of a threat a food target is', () => {
    const sut = new Cell();
    const target = new Cell();
    const SIZE_DIFF = 1;
    const FOOD_VALUE = 0.5;

    sut.size = 1;
    target.size = 1 + SIZE_DIFF;

    sut.setDietType(Cell, FOOD_VALUE);

    expect(sut.considerFood(target)).toBe(FOOD_VALUE - SIZE_DIFF);
});

test('A cell should eat a valid target', () => {
    const sut = new Cell();
    const target = new Dummy();

    sut.setDietType(Dummy, 1);

    expect(sut.eat(target)).toBeTrue();
});

test('A cell should throw when try to eat a invalid target', () => {
    const sut = new Cell();
    const target = new Dummy();

    expect(() => sut.eat(target)).toThrow();
});

test('A cell should grow it\'s maximum bite size when eating', () => {
    const sut = new Cell();
    const target = new Dummy();

    sut.energy = 1;
    target.energy = 10;

    sut.setStat(Stat.MAX_BITE_SIZE, 5);
    sut.setDietType(Dummy, 1);
    sut.eat(target);

    expect(sut.energy).toBeAprox(6);
});

test('A cell should absorb it\'s food if it\'s smaller than it\'s bite size', () => {
    const sut = new Cell();
    const target = new Dummy();

    sut.energy = 1;
    target.energy = 3;

    sut.setStat(Stat.MAX_BITE_SIZE, 5);
    sut.setDietType(Dummy, 1);
    sut.eat(target);

    expect(sut.energy).toBeAprox(4);
});

test('A cell should grow proportionally to how nutritive the food is', () => {
    const sut = new Cell();
    const target = new Dummy();

    sut.energy = 1;
    target.energy = 3;

    sut.setStat(Stat.MAX_BITE_SIZE, 10);
    sut.setDietType(Dummy, 0.5);
    sut.eat(target);

    expect(sut.energy).toBeAprox(2.5);
});
