import { Cell, cellDistance } from '../cell';
import { World } from '../lulas';
import { getSign } from '../math';
import { normalizePoint, Point, multiplyPoint } from '../point';
import { COLLISION_FRICTION } from '../CONFIGURATION';

export function solidBody(cell: Cell, { look }: World) {
  const collision = look(cell.radius * 2);

  for (let i = 0; i < collision.length; i++) {
    const other = collision[i];
    const minDistance = other.radius + cell.radius;
    const distance = cellDistance(other, cell);

    if (distance < minDistance) {
      collide(cell, other, (minDistance - distance) / 2);
    }
  }
}

function collide(a: Cell, b: Cell, correction: number) {
  const adjustment = normalizePoint(
    {
      x: a.position.x - b.position.x,
      y: a.position.y - b.position.y,
    },
    correction,
  );

  a.position.x += adjustment.x;
  a.position.y += adjustment.y;
  b.position.x -= adjustment.x;
  b.position.y -= adjustment.y;

  collisionBrake_bounce(a, b, adjustment);
}

function collisionBrake_bounce(a: Cell, b: Cell, adjustment: Point) {
  const factor = 1 - COLLISION_FRICTION;
  const vel = a.velocity;
  a.velocity = multiplyPoint(b.velocity, factor);
  b.velocity = multiplyPoint(vel, factor);
}

function collisionBrake_reflect(a: Cell, b: Cell, adjustment: Point) {
  const signX = getSign(adjustment.x);
  const signY = getSign(adjustment.y);

  if (getSign(a.velocity.x) === -signX) {
    a.velocity.x = -a.velocity.x * (1 - COLLISION_FRICTION);
  }

  if (getSign(a.velocity.y) === -signY) {
    a.velocity.y = -a.velocity.y * (1 - COLLISION_FRICTION);
  }

  if (getSign(b.velocity.x) === signX) {
    b.velocity.x = -b.velocity.x * (1 - COLLISION_FRICTION);
  }

  if (getSign(b.velocity.y) === signY) {
    b.velocity.y = -b.velocity.y * (1 - COLLISION_FRICTION);
  }
}
