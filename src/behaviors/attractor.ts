import { Behavior } from '../lulas';
import { Cell, steer } from '../cell';
import { Vector, subtractVectors } from '../vector';

export function attractor(position: Vector): Behavior {
  return (cell: Cell) => steer(cell, subtractVectors(position, cell.position));
}
