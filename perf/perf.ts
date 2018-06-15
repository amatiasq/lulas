import Game from '../src/game';
import Vector from '../src/vector';
import { random } from '../src/math';
import Cell from '../src/cell';

// Exponentially from 1 to 1024 entities
for (let entities = 1; entities <= 1024; entities *= 2) {
    const game = createGame(entities);

    runFrame(game, entities, 0);
    runFrame(game, entities, 1);
    runFrame(game, entities, 2);

    performance.measure(
        `init-${entities}`,
        `start-${entities}`,
        `ready-${entities}`,
    );
    performance.measure(
        `frame-${entities}-0`,
        `frame-start-${entities}-0`,
        `frame-end-${entities}-0`,
    );
    performance.measure(
        `frame-${entities}-1`,
        `frame-start-${entities}-1`,
        `frame-end-${entities}-1`,
    );
    performance.measure(
        `frame-${entities}-2`,
        `frame-start-${entities}-2`,
        `frame-end-${entities}-2`,
    );
    performance.measure(
        `frames-${entities}`,
        `frame-start-${entities}-0`,
        `frame-end-${entities}-2`,
    );
}

function runFrame(game, entities, frame) {
    performance.mark(`frame-start-${entities}-${frame}`);
    game.step();
    performance.mark(`frame-end-${entities}-${frame}`);
}

function createGame(entities) {
    const size = 1000;
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    performance.mark(`start-${entities}`);

    const game = new Game(canvas, Vector.of(size, size), {
        maxHistory: 100,
    });

    for (let i = 0; i < entities; i++) {
        const x = random(0, size);
        const y = random(0, size);
        const cell = game.addCell(Vector.of(x, y));

        cell.setDietType(Cell);
    }

    game.init();

    performance.mark(`ready-${entities}`);

    return game;
}