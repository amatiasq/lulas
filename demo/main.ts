import Game from '../src/game';
import Vector from '../src/vector';
import Timer from '../src/timer';
import { random } from '../src/math';
import Cell from '../src/cell';

main();

async function main() {
    await domLoaded();

    const width = window.innerWidth;
    const height = window.innerHeight - 4;

    console.log({ width, height });

    const canvas = document.querySelector('canvas#world') as HTMLCanvasElement;
    const game = new Game(canvas, Vector.of(width, height));
    const timer = new Timer(() => game.tick());

    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < 10; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const cell = game.addCell(Vector.of(x, y));

        cell.setDietType(Cell);
    }

    document.body.addEventListener('click', () => timer.toggle());
    timer.start();
}

function domLoaded() {
    return new Promise(resolve => window.addEventListener('DOMContentLoaded', resolve));
}
