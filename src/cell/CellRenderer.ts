import { TAU, random } from '../math';
import { Cell } from './Cell';

const colorCache = new Map<number, string>();

export class CellRenderer {
  private readonly color: string;

  constructor(private readonly cell: Cell) {
    this.color = getColorFor(this.cell.id);
  }

  render(context: CanvasRenderingContext2D) {
    const { pos, velocity, size } = this.cell;

    /* tslint:disable-next-line:no-bitwise */
    const radius = size | 0;
    const padding = radius * 0;

    context.save();
    context.translate(pos.x, pos.y);
    context.rotate(velocity.radians);

    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, radius, 0, TAU);
    context.fill();
    context.moveTo(padding, radius);
    context.lineTo(radius * 1.5 + padding, 0);
    context.lineTo(padding, -radius);
    context.closePath();
    context.fill();

    context.restore();
  }
}

function getColorFor(id: number) {
  const cached = colorCache.get(id);

  if (cached) {
    return cached;
  }

  const newColor = generateColor();
  colorCache.set(id, newColor);

  return newColor;
}

function generateColor() {
  const value = random(0, 0xffffff);
  const hex = value.toString(16).padStart(6, '0');

  return `#${hex}`;
}
