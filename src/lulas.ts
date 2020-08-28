import { Vector } from './point';
import { Cell, cellDistance, renderCell } from './cell';

export interface World {
  size: Vector;
  look: (radius: number) => Cell[];
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
  const context = canvas.getContext('2d')!;
  const renderCellToContext = renderCell.bind(null, context);

  let currentCell: Cell | null = null;
  const world = {
    size: worldSize,
    look(radius: number) {
      return look(currentCell!, radius);
    },
  };

  return {
    get cells() {
      return cells;
    },
    step() {
      cells = cells.map((x) => {
        const cell = { ...x };
        currentCell = x;
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
    return cells.filter(
      (x) => x !== target && cellDistance(target, x) < radius,
    );
  }
}

export default lulas;
