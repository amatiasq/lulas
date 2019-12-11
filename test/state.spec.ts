import { Cell } from '../src/Cell';
import { TAU } from '../src/math';
import { Vector } from '../src/Vector';

const properties = new Map<string, any>([
  ['size', TAU],
  ['energy', 10],
  ['pos', Vector.of(TAU, TAU)],
  ['velocity', Vector.of(TAU, TAU)],
]);

for (const [key, value] of properties) {
  test(`A cell's ${key} should not be modified immediately`, () => {
    const cell = new Cell();

    cell[key] = value;

    expect(cell[key]).not.toBe(value);
  });

  test(`A cells\s ${key} change should be applied when .flushState() is invoked`, () => {
    const cell = new Cell();

    cell[key] = value;
    cell.flushState();

    expect(cell[key]).toBe(value);
  });
}
