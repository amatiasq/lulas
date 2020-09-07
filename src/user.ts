import { Vector, vector } from './vector';
/* istanbul ignore file */

const mouseDownListeners: Listener[] = [];
const mouseUpListeners: Listener[] = [];
const keyListeners: { [index: number]: Listener[] } = {};

let mouse = vector(0);

export enum MouseButton {
  LEFT,
  MIDDLE,
  RIGHT,
}

export enum KeyboardKey {
  SPACE = 32,
}

export function onClick(activate: Listener, deactivate: Listener) {
  initMouseDetection();
}

export function onKeyPress(key: KeyboardKey, action: Listener) {
  initKeyboardDetection();

  const list = keyListeners[key] || [];
  list.push(action);
  keyListeners[key] = list;
}

function initMouseDetection() {
  document.addEventListener('mousedown', () =>
    emit(mouseDownListeners, { mouse }),
  );
  document.addEventListener('mouseup', () => emit(mouseUpListeners, { mouse }));
  document.addEventListener(
    'mousemove',
    (event) => (mouse = vector(event.clientX, event.clientY)),
  );

  // @ts-ignore
  initMouseDetection = () => {};
}

function initKeyboardDetection() {
  document.addEventListener('keydown', (event) =>
    emit(keyListeners[event.keyCode], { mouse }),
  );
  // document.addEventListener('keyup', event => emit(mouseUpListeners, {mouse}));
  // document.addEventListener('keypress', event => mouse = vector(event.clientX, event.clientY));

  // @ts-ignore
  initKeyboardDetection = () => {};
}

function emit(listeners: Listener[], event: Event) {
  listeners.forEach((x) => x(event));
}

type Listener = (event: Event) => void;

interface Event {
  mouse: Vector;
}
