import Game from '../src/game/index';
import Vector from '../src/vector';
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

    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < 10; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const cell = game.addCell(Vector.of(x, y));

        cell.setDietType(Cell);
    }

    game.addListeners();
    game.start();
    game.pause();
}

function domLoaded() {
    return new Promise(resolve => window.addEventListener('DOMContentLoaded', resolve));
}
