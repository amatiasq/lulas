import Game from './game';
import Carnivore from './life/carnivore';
import Herbivore from './life/herbivore';
import Plant from './life/plant';
import Vector from './physics/vector';
import CanvasRenderer from './renderers/canvas';
import Ticker from './ticker';


const {
  clientWidth: width,
  clientHeight: height,
} = document.documentElement;
const area = width * height;

const game = new Game(document.body);
game.renderer = new CanvasRenderer();
game.height = height;
game.width = width;

game.addEntityType('PLANT', Plant);
game.addEntityType('HERBIVORE', Herbivore);
game.addEntityType('CARNIVORE', Carnivore);

game.onEntityDie = (entity) => {
  if (entity.$entityType === 'PLANT')
    game.spawn('PLANT', new Vector(rand(width), rand(height)), rand(10, 5));
};

function rand(max: number, min = 0) {
  min = min || 0;
  // tslint:disable-next-line:no-bitwise
  return (Math.random() * (max - min) | 0) + min;
}

const SPAWN_PLANTS_PER_10K_PX = 0.2;
const SPAWN_HERBIVORES_PER_10K_PX = 0.2;
const SPAWN_CARNIVORES_PER_10K_PX = 0.05;
const CHUNK_10K_PX = 10000;
const chunks = area / CHUNK_10K_PX;

const plantCount = Math.round(chunks * SPAWN_PLANTS_PER_10K_PX);
const herbivoresCount = Math.round(chunks * SPAWN_HERBIVORES_PER_10K_PX);
const carnivoresCount = Math.round(chunks * SPAWN_PLANTS_PER_10K_PX);

for (let i = 0; i < plantCount; i++)
  game.spawn('PLANT', new Vector(rand(width), rand(height)), rand(10, 5));

for (let i = 0; i < herbivoresCount; i++)
  game.spawn('HERBIVORE', new Vector(rand(width), rand(height)), rand(10, 5));

for (let i = 0; i < carnivoresCount; i++)
  game.spawn('CARNIVORE', new Vector(rand(width), rand(height)), rand(15, 10));


game.entities.forEach(entity => entity.shove(Vector.from(rand(360), rand(100))));


const fps = document.querySelector('.fps');
let lastLog = Date.now();
let lastTick = Date.now();


const ticker = new Ticker(iteration => {
  const now = Date.now();

  if (!(iteration % 100)) {
    console.log(iteration, game.entities.length, (now - lastLog) / 1000);
    lastLog = now;
  }

  const diff = now - lastTick;
  fps.innerHTML = `
    Iteration: ${iteration}<br>
    Entities: ${game.entities.length}<br>
    FPS: ${Math.round(1000 / diff)}
  `;
  lastTick = now;

  game.tick();
});


document.addEventListener('click', () => ticker.toggle());
ticker.start();

// tslint:disable-next-line:no-any
(window as any).game = game;
