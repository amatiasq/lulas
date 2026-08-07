// Every tunable number in the simulation.
//
// CONSTANTS AND NOTHING ELSE. No logic, no helpers, no value computed from
// another module — the tuning loop is "change a number, watch, change it again",
// and a constant computed elsewhere means the value you read is not the value
// that runs. See AGENTS.md.
//
// Sizes are radii in pixels; energy is area in px² (energy = π·size²).

// --- Population, per screenful ----------------------------------------------
//
// Populations are DENSITIES, not counts: "how many on a screen this big", scaled
// by area. The same absolute numbers would be a crowd on a phone and an empty
// field on an 8K monitor, and none of the tuning below would mean anything.
// This is the screen everything was tuned on.
export const REFERENCE_WIDTH = 1440;
export const REFERENCE_HEIGHT = 900;

// Below this much world, the populations are too small to survive their own bad
// luck: measured, a phone-sized world (0.21 screenfuls) lost everything in 2 runs
// out of 3, while 0.42 survived 3 out of 3. A world smaller than this is kept at
// this size and DRAWN SMALLER instead — the camera pulls back, the ecosystem
// stays the same one.
export const MIN_WORLD_SCREENFULS = 0.5;

export const PLANTS_PER_SCREEN = 80;
export const HERBIVORES_PER_SCREEN = 40;
export const CARNIVORES_PER_SCREEN = 4;

// --- Sizes -----------------------------------------------------------------

export const PLANT_INITIAL_SIZE = 1.5;
export const HERBIVORE_INITIAL_SIZE = 5;
// Carnivores start bigger than a herbivore ever is just after splitting,
// otherwise a young carnivore has nothing it is allowed to eat.
export const CARNIVORE_INITIAL_SIZE = 14;

// Below this radius a cell is gone: eaten to nothing, or starved.
export const MIN_SIZE = 1;

// --- Vision ----------------------------------------------------------------

export const HERBIVORE_VISION_RANGE = 130;
export const CARNIVORE_VISION_RANGE = 190;

// --- Plants: the only energy input -----------------------------------------

// Area (px²) a plant adds per tick, until it reaches PLANT_MAX_AREA.
export const PLANT_GROWTH_RATE = 0.8;
export const PLANT_MAX_AREA = 200;

// Ticks between seedlings on a reference screen, scaled with the area like every
// other population figure. Grazing can take a patch to zero and growth is
// multiplicative, so without this a flattened world stays dead forever.
export const PLANT_SEED_INTERVAL = 4;

// Seeding stops above this many plants per screenful. Without it a world whose
// herbivores died out keeps filling with plants forever — a density cap, not an
// energy term.
export const PLANT_LIMIT_PER_SCREEN = 220;

// --- Movement --------------------------------------------------------------

export const HERBIVORE_MAX_SPEED = 3.6;
export const CARNIVORE_MAX_SPEED = 4.0;

export const HUNT_FORCE = 0.25;
export const ESCAPE_FORCE = 0.2;

// How much speed a head-on bump costs. Colliding cells trade the velocity ALONG
// the line between them, scaled by (1 - this): 1 stops both dead, 0 is a perfect
// bounce. Sideways speed is never touched, so grazing is free — see collision.ts.
export const COLLISION_FRICTION = 0.35;

// Area burned per tick, QUADRATIC in speed: cost = FACTOR × speed². Quadratic
// not linear on purpose — it punishes sprinting and rewards patient predators.
// See AGENTS.md invariant 7.
export const MOVEMENT_ENERGY_FACTOR = 0.045;

// --- Time travel -----------------------------------------------------------

// How many past frames are kept so the arrow keys can walk back through them.
// 600 is ten seconds at 60fps; each frame is a full copy of the world, so this
// is the memory knob as well as the how-far-back one.
export const HISTORY_SIZE = 600;

// How far `+` and `-` can take the simulation: one step every eight frames, up
// to eight steps per frame.
export const MIN_SPEED_SCALE = 1 / 8;
export const MAX_SPEED_SCALE = 8;

// --- Flocking --------------------------------------------------------------
//
// What a cell does when nothing is chasing it and there is nothing to eat: herd
// with its own kind. Never blended with fleeing or hunting — see flock.ts.

export const FLOCKING_ALIGNMENT_FACTOR = 0.05;
export const FLOCKING_COHESION_FACTOR = 0.002;
export const FLOCKING_SEPARATION_FACTOR = 0.06;

// Neighbours closer than this fraction of the vision range get pushed away from.
export const FLOCKING_SEPARATION_RANGE = 0.35;

// Cap on the summed flocking force. Well under HUNT_FORCE on purpose: herding is
// what a cell does with its spare time, and it should never look urgent.
export const FLOCKING_FORCE = 0.06;

// --- Eating ----------------------------------------------------------------

// A bite is capped at this fraction of the EATER's own energy, so a big meal
// takes several ticks and you can watch it happen.
export const MAX_BITE_FRACTION = 0.15;

// --- Mitosis ---------------------------------------------------------------

// A cell splits once its radius passes this. Per type, because the gap between
// them is what decides whether carnivores can eat anything: a herbivore is at
// most HERBIVORE_MITOSIS_SIZE and at least half of it, and a carnivore has to
// spend its life above that band to have a menu.
export const HERBIVORE_MITOSIS_SIZE = 11;
export const CARNIVORE_MITOSIS_SIZE = 28;
// How hard the two children are shoved apart, so they don't re-collide.
export const MITOSIS_SPLIT_SPEED = 4;
