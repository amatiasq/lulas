import '../test/user-stories';

import { runTests } from '../test/index';
import { flocking } from './behaviors/flocking';
import { move } from './behaviors/move';
import { roundMap } from './behaviors/roundMap';
import { solidBody } from './behaviors/solidBody';
import { createCell, logCell } from './cell';
import { randomColor } from './color';
import lulas from './lulas';
import { random } from './math';
import { vector } from './vector';

(async () => {
  setStyles();
  await runTests({
    background: 'black',
  });
  start();
})();

setTimeout(() => {
  document.body.style.backgroundColor = 'black';
});

function start() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const center = vector(canvas.width / 2, canvas.height / 2);
  const createRandomCell = (i: number) =>
    createCell({
      position: { ...center },
      velocity: vector(random(10), random(10)),
      radius: random(5, 20),
      color: randomColor(),
    });

  const game = lulas({
    canvas,
    cells: array(50, createRandomCell),
    behaviors: [flocking, move, solidBody, roundMap],
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
