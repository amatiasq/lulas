import { Entity, EntityType, isAnimal } from './entity';
import { magnitude, radians, Vector } from './vector';

/**
 * Dark green plants, light green herbivores, red carnivores, each split into a
 * dimmed body and the full-strength colour as a rim. A flat disc reads as a
 * blob; a dark disc with a lit edge reads as a cell.
 *
 * Exported because every entity is a circle, so colour is the only thing the
 * render spec can tell the three apart by.
 */
export const PALETTE: Record<EntityType, { body: string; rim: string }> = {
  plant: { body: '#053200', rim: '#0f9600' },
  herbivore: { body: '#1e5e1e', rim: '#7dff7d' },
  carnivore: { body: '#5e1010', rim: '#ff4040' },
};

const BACKGROUND = '#000000';

// How far ahead of the cell the point reaches, per px/tick of speed. Speed is
// read off its length, exactly as it was off the old stick.
const VELOCITY_TIP_FACTOR = 3.5;

// How much of the body the nose grows out of: the arc stops this far short of
// the heading on each side, so the body covers 2π minus twice this. A quarter
// turn leaves the same three-quarter body `flocking/` draws.
const NOSE_OPENING = Math.PI / 4;

// A nose shorter than this much of the radius is not worth drawing — the cell is
// barely moving and it only makes the outline lumpy.
const NOSE_MIN_REACH = 1.15;

// How far each cell's shade may stray from its type's colour, up or down.
const SHADE_VARIATION = 0.22;

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
  const reach = entity.size + VELOCITY_TIP_FACTOR * 2;

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
  const { body, rim } = shadeOf(entity);

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

  // ONE silhouette, filled and outlined once. Two shapes pretending to be one
  // (a circle with a triangle behind it) read as a ball with a dart stuck in it.
  // A cell with nowhere to be is simply a circle.
  const speed = magnitude(entity.velocity);
  const tip = radius + speed * VELOCITY_TIP_FACTOR;

  if (!isAnimal(entity) || tip <= radius * NOSE_MIN_REACH) {
    context.arc(0, 0, radius, 0, Math.PI * 2);
  } else {
    const angle = radians(entity.velocity);

    // The back three quarters of the body, then out to the point and back. The
    // arc stops short of the heading on both sides, so the nose grows out of the
    // flanks instead of being glued to a full circle.
    context.arc(0, 0, radius, angle + NOSE_OPENING, angle - NOSE_OPENING);
    context.lineTo(Math.cos(angle) * tip, Math.sin(angle) * tip);
  }

  context.closePath();
  context.fill();
  context.stroke();

  context.restore();
}

/**
 * The type's colours, nudged a little per cell.
 *
 * Type still has to be readable at a glance — that is the whole spec — so the
 * nudge is small and never crosses between greens and reds. It is what makes
 * `flocking/` pleasant to look at: fifty identical shapes in one flat colour
 * read as a texture, and the same fifty in fifty shades read as a crowd.
 *
 * Derived from the id, so a cell keeps its shade for life instead of shimmering
 * every frame.
 */
export function shadeOf(entity: Entity) {
  const { body, rim } = PALETTE[entity.type];
  // A cheap hash: consecutive ids must not come out as a gradient.
  const noise = Math.sin(Number(entity.id) * 12.9898) * 43758.5453;
  const shade = 1 + ((noise - Math.floor(noise)) * 2 - 1) * SHADE_VARIATION;

  return { body: scaleColor(body, shade), rim: scaleColor(rim, shade) };
}

function scaleColor(color: string, factor: number) {
  const channels = [1, 3, 5].map((at) => {
    const value = Math.round(parseInt(color.slice(at, at + 2), 16) * factor);
    return Math.min(255, Math.max(0, value)).toString(16).padStart(2, '0');
  });

  return `#${channels.join('')}`;
}
