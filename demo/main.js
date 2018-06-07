import Game from '../out/game.js';
import Vector from '../out/vector.js';
import Timer from '../out/timer.js';
import { random } from '../out/math.js';
import Cell from '../out/cell.js';

main();

async function main() {
    await domLoaded();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const canvas = document.querySelector('canvas#world');
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
