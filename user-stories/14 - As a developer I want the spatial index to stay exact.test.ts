import { ok } from 'assert';

import { broadPhaseReach } from '../src/collision';
import { Entity, EntityType } from '../src/entity';
import { look, lookAround } from '../src/senses';
import { indexEntities } from '../src/spatial';
import { vector } from '../src/vector';
import { shortestDistance } from '../src/world';
import { setFilename, test } from '../test/index';
import { entity, TEST_WORLD } from '../test/test-duplicates';

setFilename(__dirname, __filename);

const { worldSize } = TEST_WORLD;

/**
 * Perception and collisions go through a quadtree, so "same answer as
 * measuring the distance to everything" became something to prove: a lost
 * neighbour just quietly changes the ecosystem. The wrap is the sharp edge —
 * the tree knows nothing about a toroidal world, so edge queries split and
 * ask again on the far side; half the layouts below press against edges and
 * corners on purpose.
 */
function randoms(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function ids(entities: Entity[]) {
  return entities
    .map((it) => String(it.id))
    .sort()
    .join(',');
}

const TYPES: EntityType[] = ['plant', 'herbivore', 'carnivore'];

function randomCrowd(random: () => number, count: number, edgeHugging: boolean) {
  return Array.from({ length: count }, (_, i) => {
    const type = TYPES[i % TYPES.length];

    // Edge-hugging layouts put everything within 30px of a border, so most
    // queries straddle a seam and the four-box path is the one under test.
    const position = edgeHugging
      ? vector(
          random() < 0.5 ? random() * 30 : worldSize.x - random() * 30,
          random() < 0.5 ? random() * 30 : worldSize.y - random() * 30,
        )
      : vector(random() * worldSize.x, random() * worldSize.y);

    return entity(type, position, 3 + random() * 12);
  });
}

test('lookAround() sees exactly what look() sees, anywhere on the map', () => {
  const random = randoms(20260803);

  for (let trial = 0; trial < 60; trial++) {
    const crowd = randomCrowd(random, 40, trial % 2 === 0);
    const index = indexEntities(crowd, worldSize);

    for (const cell of crowd) {
      ok(
        ids(lookAround(cell, index, worldSize)) === ids(look(cell, crowd, worldSize)),
        `trial ${trial}, cell ${cell.id} at ${cell.position.x},${cell.position.y}`,
      );
    }
  }
});

test('the collision broad phase never loses an overlapping pair', () => {
  // The narrow phase is unchanged, so what the rewrite can break is candidacy:
  // a pair that overlaps has to be offered to the loop in the first place.
  const random = randoms(981);

  for (let trial = 0; trial < 60; trial++) {
    // A third of the map's width, so the crowd is dense enough that pairs
    // actually overlap, and pressed into a corner every other trial.
    const crowd = randomCrowd(random, 40, trial % 2 === 0);
    const index = indexEntities(crowd, worldSize);
    const reach = broadPhaseReach(crowd);

    for (const left of crowd) {
      const candidates = new Set(
        index.candidatesNear(left.position, left.size + reach),
      );

      for (const right of crowd) {
        if (right.id === left.id) continue;

        const distance = shortestDistance(
          left.position,
          right.position,
          worldSize,
        );

        if (distance >= left.size + right.size) continue;

        ok(
          candidates.has(right),
          `trial ${trial}: ${left.id} overlaps ${right.id} at ${distance.toFixed(2)} but was not offered it`,
        );
      }
    }
  }
});

test('a query wider than the world still returns the whole world', () => {
  // Both halves of the reach meet on the far side: splitting the span would
  // hand back the same entities twice.
  const crowd = randomCrowd(randoms(7), 30, false);
  const index = indexEntities(crowd, worldSize);
  const found = index.candidatesNear(vector(0, 0), worldSize.x * 2);

  ok(found.length === crowd.length, `${found.length} of ${crowd.length}`);
  ok(new Set(found).size === found.length, 'no duplicates');
});

test('a cell at the very corner sees across both seams', () => {
  const corner = entity('carnivore', vector(1, 1), 5);
  const across = entity('plant', vector(worldSize.x - 1, worldSize.y - 1), 5);
  const far = entity('plant', vector(worldSize.x / 2, worldSize.y / 2), 5);

  const crowd = [corner, across, far];
  const index = indexEntities(crowd, worldSize);

  ok(
    ids(lookAround(corner, index, worldSize)) === ids([across]),
    'the diagonal neighbour is 2.83px away, not a map away',
  );
});
