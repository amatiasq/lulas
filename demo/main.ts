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

    const query = parseQuery();
    const entities = query.get('cells') || 10;
    const canvas = document.querySelector('canvas#world') as HTMLCanvasElement;
    const game = new Game(canvas, Vector.of(width, height), {
        hasHistory: Boolean(query.get('history')),
    });

    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < entities; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const cell = game.addCell(Vector.of(x, y));

        cell.setDietType(Cell);
    }

    game.addListeners();
    game.start();
    game.pause();
    game.render();

    (window as any).game = game;
}

function domLoaded() {
    return new Promise(resolve => window.addEventListener('DOMContentLoaded', resolve));
}

function parseQuery() {
    const keyValue = window.location.search
        .substr(1)
        .split('&')
        .filter(Boolean)
        .map((entry): [ string, number ] => {
            const [ key, value ] = entry.split('=');
            const num = parseInt(value);

            if (isNaN(num)) {
                throw new Error(`Invalid option "${key}" is not a number "${value}" "${num}"`)
            }

            return [ key, num ];
        })

    return new Map<string, number>(keyValue);
}