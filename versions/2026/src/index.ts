/* istanbul ignore file */

import { simulation } from './simulation';

setStyles();
registerServiceWorker();
start();

function start() {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const game = simulation({ canvas });

  let isPaused = false;
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      isPaused = !isPaused;
    }
  });

  game.render();
  requestAnimationFrame(function frame() {
    if (!isPaused) {
      game.step();
    }

    game.render();
    requestAnimationFrame(frame);
  });
}

function setStyles() {
  const fullscreen = { margin: '0', padding: '0', height: '100%' };

  for (const el of [document.documentElement, document.body]) {
    Object.assign(el.style, fullscreen);
  }

  document.body.style.backgroundColor = 'black';
  document.body.style.overflow = 'hidden';
}

function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
