import { equal, ok } from 'assert';

import { controls } from '../src/controls';
import { MAX_SPEED_SCALE, MIN_SPEED_SCALE } from '../src/CONFIGURATION';
import { setFilename, test } from '../test/index';

setFilename(__dirname, __filename);

/** A simulation that only counts what it was asked to do. */
function fakeGame() {
  return { steps: 0, backs: 0, behind: 0, step() { this.steps++; }, back() { this.backs++; } };
}

test('It runs one step per frame at normal speed', () => {
  const game = fakeGame();
  const time = controls(game);

  time.frame();
  time.frame();

  equal(game.steps, 2);
});

test('Space pauses and resumes', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('Space');
  time.frame();
  equal(game.steps, 0, 'paused, so the frame did nothing');

  time.press('Space');
  time.frame();
  equal(game.steps, 1);
});

test('The arrows walk one frame at a time, and pause', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('ArrowRight');
  ok(time.isPaused, 'stepping by hand means you want it still');
  equal(game.steps, 1);

  time.press('ArrowLeft');
  equal(game.backs, 1);

  // And the loop keeps its hands off while paused.
  time.frame();
  equal(game.steps, 1);
});

test('Plus and minus double and halve the speed', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('Equal', '+');
  equal(time.speed, 2);

  time.press('Minus', '-');
  time.press('Minus', '-');
  equal(time.speed, 0.5);
});

test(
  'Plus and minus answer to the numpad and to the character itself',
  [['NumpadAdd', undefined], ['Equal', undefined], ['Digit1', '+']],
  (code: string, key: string | undefined) => {
    const time = controls(fakeGame());

    ok(time.press(code, key), `${code}/${key} should be handled`);
    equal(time.speed, 2);
  },
);

test('Speed is clamped at both ends', () => {
  const time = controls(fakeGame());

  for (let i = 0; i < 20; i++) time.press('Equal', '+');
  equal(time.speed, MAX_SPEED_SCALE);

  for (let i = 0; i < 40; i++) time.press('Minus', '-');
  equal(time.speed, MIN_SPEED_SCALE);
});

test('Doubling the speed runs two steps in one frame', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('Equal', '+');
  time.frame();

  equal(game.steps, 2);
});

test('Halving it runs one step every other frame — and never rounds down to a stop', () => {
  const game = fakeGame();
  const time = controls(game);

  time.press('Minus', '-');
  time.frame();
  equal(game.steps, 0);

  time.frame();
  equal(game.steps, 1, 'the leftover half is kept, not truncated away');
});

test('Keys it does not know are left for the page', () => {
  const time = controls(fakeGame());

  equal(time.press('KeyQ'), false);
  equal(time.press('Enter'), false);
});

test('The title says what is going on, since the canvas has no numbers', () => {
  const game = fakeGame();
  const time = controls(game);

  equal(time.status, 'lulas');

  time.press('Equal', '+');
  equal(time.status, 'lulas ×2');

  time.press('Space');
  game.behind = 12;
  equal(time.status, 'lulas — paused, 12 frames back ×2');
});
