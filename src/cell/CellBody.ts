import { pow, sqrt } from '../math';
import { Stat } from '../Stat';
import { Cell } from './Cell';
import { CellState } from './CellState';

export class CellBody {
  get isAlive() {
    return this.state.isAlive;
  }

  get size() {
    return this.state.size;
  }
  set size(value: number) {
    this.state.size = value;

    if (value === 0) {
      this.die();
    }
  }

  get energy() {
    return pow(this.size, 2) * Math.PI;
  }
  set energy(value) {
    this.size = sqrt(value / Math.PI);
  }

  constructor(private readonly cell: Cell, private readonly state: CellState) {
    this.state.isAlive = true;
    this.state.size = 1;
  }

  canMitos() {
    const minSize = this.cell.getStat(Stat.MITOSIS_MIN_RADIUS);

    return this.size > minSize;
  }

  mitos() {
    const minSize = this.cell.getStat(Stat.MITOSIS_MIN_RADIUS);
    const childCount = Math.floor(this.size / (minSize / 2));
    const childEnergy = this.energy / childCount;
    const children = [];

    for (let i = 0; i < childCount; i++) {
      const child = new Cell();
      child.energy = childEnergy;
      this.inherit(child);
      children.push(child);
    }

    this.cell.emit('mitos', children);
    this.die();

    return children;
  }

  die() {
    this.state.isAlive = false;
    this.cell.emit('die', this.cell);
  }

  private inherit(child: Cell) {
    child.setParent(this.cell);
  }
}
