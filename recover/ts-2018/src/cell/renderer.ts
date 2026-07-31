import { random, TAU } from '../math';
import Cell from './index';
import CellState from './state';

export default class CellRenderer {

    private get color() {
        return this.state.color;
    }
    private set color(value: string) {
        this.state.color = value;
    }

    constructor(
        private cell: Cell,
        private state: CellState,
    ) {
        this.color = generateColor();
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

function generateColor() {
    const value = random(0, 0xFFFFFF);
    const hex = value.toString(16).padStart(6, '0');

    return `#${hex}`;
}
