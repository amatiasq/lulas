import './user-stories';
import { runTests } from '../test';
import lulas from './lulas';
import { createCell } from './cell';

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

  const game = lulas({
    canvas,
    cells: [
      createCell({
        position: { x: canvas.width / 2, y: canvas.height / 2 },
        velocity: { x: Math.random() * 6 - 3, y: Math.random() * 6 - 3 },
        radius: 10,
      }),
    ],
  });

  game.render();
  requestAnimationFrame(function frame() {
    game.step();
    game.render();
    requestAnimationFrame(frame);
  });
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
