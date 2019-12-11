import { Stat } from '../Stat';
import { Vector } from '../Vector';
import { Cell } from './Cell';
import { buffer, bufferProp } from './CellState-buffer';

@buffer
export class CellState {
  private readonly stats = new Map<Stat, number>();

  @bufferProp
  isAlive: boolean;

  @bufferProp
  size: number;

  @bufferProp
  pos: Vector;

  @bufferProp
  velocity: Vector;

  constructor(private readonly cell: Cell) {}

  getStat(key: Stat) {
    return this.stats.get(key);
  }

  setStat(key: Stat, value: number) {
    this.stats.set(key, value);
  }

  //
  // Methods injected by decorators
  //

  getState(): IStateScreenshot {
    return null;
  }

  // tslint:disable-next-line: no-empty
  setState(newState: IStateScreenshot) {}

  // tslint:disable-next-line: no-empty
  flushState() {}
}

export interface IStateScreenshot {
  isAlive: boolean;
  size: number;
  pos: Vector;
  velocity: Vector;
}
