import { random, TAU, PI } from '../math';
import Cell from './index';

export default class CellRenderer {

    color = '#' + random(0, 0xFFFFFF)
        .toString(16)
        .padStart(6, '0');

    constructor(
        private cell: Cell,
    ) {}

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

        context.beginPath()
        context.arc(0, 0, radius, 0, TAU)
        context.fill()
        context.moveTo(radius, padding)
        context.lineTo(0, radius * 1.5 + padding)
        context.lineTo(-radius, padding)
        context.closePath()
        context.fill()

        context.restore();
    }

}
