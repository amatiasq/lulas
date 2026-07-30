import { Cell, cellDistance, renderCell } from './cell';
import { Vector } from './vector';

export interface World {
  size: Vector;
  look: (cell: Cell, radius: number) => Cell[];
}

export type Behavior = (cell: Cell, world: World) => void;

export interface LulasConfig {
  canvas: HTMLCanvasElement;
  cells: Cell[];
  behaviors: Behavior[];
  worldSize?: Vector;
}

export function lulas({
  canvas,
  cells,
  behaviors,
  worldSize = { x: canvas.width, y: canvas.height },
}: LulasConfig) {
  const world: World = {
    size: worldSize,
    look,
  };

  const context = canvas.getContext('2d')!;
  const renderCellToContext = renderCell.bind(null, context, world);

  return {
    get cells() {
      return cells;
    },
    step() {
      cells = cells.map((x) => {
        const cell = { ...x };
        behaviors.forEach((b) => b(cell, world));
        return cell;
      });
    },
    render() {
      context.strokeStyle = 'blue';
      context.fillStyle = 'blue';
      context.clearRect(0, 0, canvas.width, canvas.height);
      cells.forEach(renderCellToContext);
    },
  };

  function look(target: Cell, radius: number): Cell[] {
    // Compare by id: `target` is the mid-step copy, never identity-equal to the
    // originals still in `cells`.
    return cells.filter(
      (x) => x.id !== target.id && cellDistance(target, x) < radius,
    );
  }
}

export default lulas;
