import { Point } from './Point';
import { Cell, stepCell, renderCell } from './cell';
export interface LulasConfig {
  canvas: HTMLCanvasElement;
  cells: Cell[];
  worldSize?: Point;
}

export function lulas({
  canvas,
  cells,
  worldSize = { x: canvas.width, y: canvas.height },
}: LulasConfig) {
  const context = canvas.getContext('2d')!;
  const stepCellToMap = stepCell.bind(null, worldSize);
  const renderCellToContext = renderCell.bind(null, context);

  return {
    step() {
      cells = cells.map((x) => stepCellToMap({ ...x }));
    },
    render() {
      context.strokeStyle = 'blue';
      context.fillStyle = 'blue';
      context.clearRect(0, 0, canvas.width, canvas.height);
      // context.fillRect(0, 0, canvas.width, canvas.height);
      cells.forEach(renderCellToContext);
    },
  };
}

export default lulas;
