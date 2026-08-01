import { Entity, EntityType, isAnimal } from './entity';
import { radians, Vector } from './vector';

// The 2014 palette: dark green plants, light green herbivores, red carnivores.
const COLOR: Record<EntityType, string> = {
  plant: '#0a6400',
  herbivore: '#64ff64',
  carnivore: '#ff2d2d',
};

const BACKGROUND = '#000000';

// How much of the velocity the stick shows. Speed is read off its length.
const VELOCITY_STICK_FACTOR = 6;

export function render(
  context: CanvasRenderingContext2D,
  size: Vector,
  entities: Entity[],
) {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, size.x, size.y);

  // Plants are the ground layer, always under the cells: a herbivore sits ON a
  // plant to eat it, and drawing them in array order let the plant cover the
  // cell that was eating it. Two passes, cheaper than sorting every frame.
  for (const entity of entities) {
    if (entity.type === 'plant') renderEntity(context, size, entity);
  }

  for (const entity of entities) {
    if (entity.type !== 'plant') renderEntity(context, size, entity);
  }
}

/**
 * Draw the entity, plus a copy on the far side for anything near an edge, so
 * the wrap looks seamless instead of things popping in and out.
 * (Same trick as `flocking/src/cell.ts` → `renderCell`.)
 */
function renderEntity(
  context: CanvasRenderingContext2D,
  size: Vector,
  entity: Entity,
) {
  const { position } = entity;
  const reach = entity.size + VELOCITY_STICK_FACTOR * 2;

  drawAt(context, entity, position);

  const wrapX = position.x - reach < 0 ? size.x : position.x + reach > size.x ? -size.x : 0;
  const wrapY = position.y - reach < 0 ? size.y : position.y + reach > size.y ? -size.y : 0;

  if (wrapX) drawAt(context, entity, { x: position.x + wrapX, y: position.y });
  if (wrapY) drawAt(context, entity, { x: position.x, y: position.y + wrapY });
  if (wrapX && wrapY)
    drawAt(context, entity, { x: position.x + wrapX, y: position.y + wrapY });
}

function drawAt(
  context: CanvasRenderingContext2D,
  entity: Entity,
  position: Vector,
) {
  context.save();
  context.translate(position.x, position.y);
  context.fillStyle = COLOR[entity.type];
  context.strokeStyle = COLOR[entity.type];

  if (entity.type === 'plant') {
    // Squares, so plants never read as small cells.
    const side = entity.size * 2;
    context.fillRect(-entity.size, -entity.size, side, side);
  } else {
    context.beginPath();
    context.arc(0, 0, entity.size, 0, Math.PI * 2);
    context.fill();
  }

  if (isAnimal(entity)) {
    // The stick IS the velocity readout: direction is the heading, length is
    // the speed. No numbers on screen.
    const angle = radians(entity.velocity);
    const length =
      Math.hypot(entity.velocity.x, entity.velocity.y) * VELOCITY_STICK_FACTOR;

    if (length > 0) {
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      context.stroke();
    }
  }

  context.restore();
}
