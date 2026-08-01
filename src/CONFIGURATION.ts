// Every tunable number in the simulation.
//
// CONSTANTS AND NOTHING ELSE. No logic, no helpers, no value computed from
// another module — the tuning loop is "change a number, watch, change it again",
// and a constant computed elsewhere means the value you read is not the value
// that runs. See AGENTS.md.
//
// Sizes are radii in pixels; energy is area in px² (energy = π·size²).

// --- Population at start ---------------------------------------------------

export const INITIAL_PLANTS = 80;
export const INITIAL_HERBIVORES = 40;
export const INITIAL_CARNIVORES = 4;

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

// Ticks between new seedlings appearing somewhere at random. Grazing can take a
// patch to zero, and a plant population of zero can never recover on growth
// alone. See AGENTS.md invariant 8 — this is part of the plant source, not a
// second one.
export const PLANT_SEED_INTERVAL = 4;

// Seeding stops above this many plants. Without it a world whose herbivores
// died out keeps filling with plants forever — a density cap, not an energy
// term.
export const PLANT_MAX_COUNT = 220;

// --- Movement --------------------------------------------------------------

export const HERBIVORE_MAX_SPEED = 3.6;
export const CARNIVORE_MAX_SPEED = 4.0;

export const HUNT_FORCE = 0.25;
export const ESCAPE_FORCE = 0.2;

// How much speed a bump costs. Cells that collide swap velocities scaled by
// (1 - this), so 1 stops both dead and 0 is a frictionless exchange.
export const COLLISION_FRICTION = 0.5;

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

// Area burned per tick, QUADRATIC in speed: cost = FACTOR × speed².
// Quadratic (not linear) on purpose — it punishes sprinting and rewards patient
// predators, which is the strategy space we want. See AGENTS.md invariant 7.
export const MOVEMENT_ENERGY_FACTOR = 0.045;

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
