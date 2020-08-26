import '../user-stories';
import { runTests } from '../user-stories/test';

(() => {
  setStyles();
  runTests({
    background: 'black',
  });
})();

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
