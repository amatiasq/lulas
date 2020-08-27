import './user-stories';
import { runTests } from '../test/index';
import lulas from './lulas';
import { createCell, logCell } from './cell';
import { point } from './point';
import { flocking } from './behaviors/flocking';
import { move } from './behaviors/move';
import { roundMap } from './behaviors/roundMap';

(async () => {
  setStyles();
  await runTests({
    background: 'black',
  });
  start();
})();

function start() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const center = point(canvas.width / 2, canvas.height / 2);
  const createRandomCell = (i: number) =>
    createCell({
      position: { ...center },
      velocity: point(random(10), random(10)),
      radius: random(5, 20),
    });

  const game = lulas({
    canvas,
    cells: array(10, createRandomCell),
    behaviors: [flocking, move, roundMap],
  });

  console.log('Initial state');
  logState();

  game.render();
  requestAnimationFrame(function frame() {
    game.step();
    game.render();
    requestAnimationFrame(frame);
  });

  function logState() {
    console.log(game.cells.map(logCell).join('\n'));
  }
}

function random(first: number, second = -first) {
  const min = Math.min(first, second);
  const max = Math.max(first, second);
  return Math.round(Math.random() * (max - min) + min);
}

function array<T>(size: number, operator: (pos: number) => T): T[] {
  return Array(size)
    .fill(null)
    .map((_, i) => i + 1)
    .map(operator);
}

function setStyles() {
  const fullscreen = {
    margin: 0,
    padding: 0,
    height: '100%',
  };

  for (const el of [document.documentElement, document.body]) {
    Object.assign(el.style, fullscreen);
  }
}
