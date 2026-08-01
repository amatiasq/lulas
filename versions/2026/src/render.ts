import { Entity, EntityType, isAnimal } from './entity';
import { radians, Vector } from './vector';

/**
 * The 2014 palette — dark green plants, light green herbivores, red carnivores —
 * split in two: a dimmed body and the full-strength colour as a rim around it.
 * A flat disc reads as a blob; a dark disc with a lit edge reads as a cell.
 *
 * Exported so the render spec can tell the three apart by colour: everything is
 * a circle now, so the shape no longer says what something is.
 */
export const PALETTE: Record<EntityType, { body: string; rim: string }> = {
  plant: { body: '#053200', rim: '#0f9600' },
  herbivore: { body: '#1e5e1e', rim: '#7dff7d' },
  carnivore: { body: '#5e1010', rim: '#ff4040' },
};

const BACKGROUND = '#000000';

// How much of the velocity the stick shows. Speed is read off its length.
const VELOCITY_STICK_FACTOR = 6;

// The rim scales with the cell, or a fat carnivore reads as a flat disc with a
// hairline on it and a seedling reads as pure outline. Clamped at both ends.
const RIM_FACTOR = 0.15;
const RIM_MIN = 0.5;
const RIM_MAX = 2;
const MIN_BODY_RADIUS = 0.5;

export function render(
  context: CanvasRenderingContext2D,
  worldSize: Vector,
  entities: Entity[],
) {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, worldSize.x, worldSize.y);

  // Plants are the ground layer, always under the cells: a herbivore sits ON a
  // plant to eat it, and drawing them in array order let the plant cover the
  // cell that was eating it. Two passes, cheaper than sorting every frame.
  for (const entity of entities) {
    if (entity.type === 'plant') renderEntity(context, worldSize, entity);
  }

  for (const entity of entities) {
    if (entity.type !== 'plant') renderEntity(context, worldSize, entity);
  }
}

/**
 * Draw the entity, plus a copy on the far side for anything near an edge, so
 * the wrap looks seamless instead of things popping in and out.
 * (Same trick as `flocking/src/cell.ts` → `renderCell`.)
 */
function renderEntity(
  context: CanvasRenderingContext2D,
  worldSize: Vector,
  entity: Entity,
) {
  const { position } = entity;
  const reach = entity.size + VELOCITY_STICK_FACTOR * 2;

  drawAt(context, entity, position);

  const wrapX = position.x - reach < 0 ? worldSize.x : position.x + reach > worldSize.x ? -worldSize.x : 0;
  const wrapY = position.y - reach < 0 ? worldSize.y : position.y + reach > worldSize.y ? -worldSize.y : 0;

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
  const { body, rim } = PALETTE[entity.type];

  context.save();
  context.translate(position.x, position.y);
  context.fillStyle = body;
  context.strokeStyle = rim;

  // Everything is a circle, plants included. A stroke straddles the path, so the
  // circle is drawn half a rim short of the real radius: `entity.size` is what
  // decides who eats whom and who bumps into whom, and the drawing has to be the
  // same size as the thing it is drawing.
  const width = Math.min(RIM_MAX, Math.max(RIM_MIN, entity.size * RIM_FACTOR));
  const radius = Math.max(MIN_BODY_RADIUS, entity.size - width / 2);

  context.lineWidth = width;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

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
