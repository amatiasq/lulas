import { random, TAU } from '../math';
import Cell from './index';

const colorCache = new Map<number, string>();

export default class CellRenderer {

    private color: string;

    constructor(
        private cell: Cell,
    ) {
        this.color = getColorFor(this.cell.id);
    }

    render(context: CanvasRenderingContext2D) {
        const {
            pos,
            velocity,
            size,
        } = this.cell;

        /* tslint:disable-next-line:no-bitwise */
        const radius = size | 0;
        const padding = radius * 0.;

        context.save();
        context.translate(pos.x, pos.y);
        context.rotate(velocity.radians - TAU / 4);

        context.fillStyle = this.color;

        context.beginPath();
        context.arc(0, 0, radius, 0, TAU);
        context.fill();
        context.moveTo(radius, padding);
        context.lineTo(0, radius * 1.5 + padding);
        context.lineTo(-radius, padding);
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
    const value = random(0, 0xFFFFFF);
    const hex = value.toString(16).padStart(6, '0');

    return `#${hex}`;
}
