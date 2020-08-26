import { Cell, stepCell, renderCell } from './cell';
export interface LulasConfig {
  canvas: HTMLCanvasElement;
  cells: Cell[];
}

export function lulas({ canvas, cells }: LulasConfig) {
  const context = canvas.getContext('2d')!;
  const renderCellToContext = renderCell.bind(null, context);

  return {
    step() {
      cells = cells.map((x) => stepCell({ ...x }));
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
