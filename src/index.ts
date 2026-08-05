/* istanbul ignore file */

import { controls } from './controls';
import { fpsMeter } from './debug';
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

  const time = controls(game);
  const fps = fpsMeter();

  // `undefined` hides the panel: the frame rate is the only thing the page owns,
  // so passing it is also how it asks for the panel to be drawn.
  const overlay = () => (time.isDebug ? fps.fps : undefined);

  window.addEventListener('keydown', (event) => {
    if (!time.press(event.code, event.key)) return;

    event.preventDefault();
    game.render(overlay());
    document.title = time.status;
  });

  game.render();
  requestAnimationFrame(function frame(now) {
    fps.sample(now);
    time.frame();
    game.render(overlay());
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
