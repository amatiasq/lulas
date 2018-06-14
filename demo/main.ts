import Game, { GameOnTickParams } from '../src/game/index';
import Vector from '../src/vector';
import { random, round } from '../src/math';
import Cell from '../src/cell';
import state from './persisted-state';

main();

async function main() {
    await domLoaded();

    const $fps = document.querySelector('#fps');
    const $entities = document.querySelector('#entities');
    const $tick = document.querySelector('#tick');

    const width = window.innerWidth;
    const height = window.innerHeight - 4;

    console.log({ width, height });

    let prev = Date.now();
    const query = parseQuery();
    const entities = query.get('cells') || 10;
    const canvas = document.querySelector('canvas#world') as HTMLCanvasElement;
    const game = new Game(canvas, Vector.of(width, height), {
        maxHistory: query.get('history'),
        onTick,
    });

    canvas.width = width;
    canvas.height = height;

    for (let i = 0; i < entities; i++) {
        const x = random(0, width);
        const y = random(0, height);
        const cell = game.addCell(Vector.of(x, y));

        cell.setDietType(Cell);
    }

    game.init();
    state.save(game.getState());
    state.log();

    if (!query.get('pause')) {
        game.play();
    }

    Object.assign(window, {
        game,
        rename: state.rename,
        load(id: string) {
            game.setState(state.load(id));
            game.render();
        },
    });

    function onTick({ tick, entities }: GameOnTickParams) {
        const now = Date.now();
        const delta = now - prev;

        prev = now;
        $tick.innerHTML = String(tick);
        $entities.innerHTML = String(entities.length);
        $fps.innerHTML = String(round(1000 / delta, 0));
    }
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