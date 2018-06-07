import { random, TAU } from "../math.js";
import Cell from "./index.js";

export default class CellRenderer {

    color = "#" + random(0, 0xFFFFFF)
        .toString(16)
        .padStart(6, "0");

    constructor(
        private cell: Cell,
    ) {}

    render(context: CanvasRenderingContext2D) {
        const {
            pos,
            velocity,
            size: radius,
        } = this.cell;

        context.save();
        context.translate(pos.x, pos.y);
        context.fillStyle = this.color;

        /* tslint:disable:no-bitwise */
        context.beginPath();
        context.arc(0, 0, radius | 0, 0, TAU);
        context.fill();

        // if (movement.magnitude !== 0) {
        //   context.beginPath();
        //   context.moveTo(0, 0);
        //   context.lineTo(movement.x | 0, movement.y | 0);
        //   context.stroke();

        //   context.fillStyle = 'blue';
        //   context.translate(movement.x | 0, movement.y | 0);
        //   context.arc(0, 0, 2, 0, Math.PI * 2);
        //   context.fill();
        // }
        /* tslint:enable:no-bitwise */

        context.restore();
    }

}
