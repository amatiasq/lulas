# lulas — AGENTS.md

Predator/prey ecosystem simulation: plants, herbivores, carnivores, size-based
eating, mitosis, on a toroidal map. Human-facing spec: [`README.md`](README.md).
This file is the same rules as things you can implement and test, plus the traps.

Bun + Vite + Vitest, specs in `user-stories/`.
`amq lulas dev | test | build | check`.

It joins the `mono/npm` workspace for `@amatiasq/quadtree` + `@amatiasq/geometry`
as `workspace:*`. `amq mono push-subtree` strips `workspaces` and pins the
published versions on the way out, so **the libs must be published before the
mirror runs** or `bun install` in the standalone repo 404s.

`recover/` holds three archived versions (`js-2014`, `ts-2018`, `ts-2020`) as a
**closed archive**: verbatim trees kept as evidence. Do not lint, format, upgrade
or build on top of them, and **never add a file to `recover/`**. Rule-by-rule
scorecard: [`recover/README.md`](recover/README.md).

## Where things live

One concern per file; none of them is big.

| file | what is in it |
| --- | --- |
| `src/CONFIGURATION.ts` | every tunable number, and nothing else |
| `src/world.ts` | the toroidal map: `shortestDelta`, `shortestDistance`, `wrapPosition` |
| `src/vector.ts` | plain vector maths |
| `src/entity.ts` | the entity, per-type stats, and `energy ⇄ size` |
| `src/diet.ts` | `canEat` / `flees` — invariant 2, in one place |
| `src/senses.ts` | `look` and `nearest`, both toroidal; `lookAround` asks the index first |
| `src/spatial.ts` | the quadtree broad phase: "what is near here", wrap included |
| `src/behavior.ts` | `decide` — flee, else hunt/eat, else flock, else coast |
| `src/flock.ts` | boids, same species only, idle only |
| `src/collision.ts` | solid bodies: nothing stands inside anything else |
| `src/life.ts` | `bite`, `grow`, `move`, `burnMovementEnergy`, `split` |
| `src/step.ts` | one tick: perceive from a snapshot, act, move, split, bury |
| `src/render.ts` | canvas drawing, wrap-aware |
| `src/timeline.ts` | the recorded past, so time can be stepped backwards |
| `src/controls.ts` | space / arrows / +- / d, kept away from the DOM so it is testable |
| `src/debug.ts` | the **D** overlay: the quadtree's grid, fps, ms/tick, counts, energy |
| `src/simulation.ts` | wires it to a canvas, spawns the world, seeds plants |

Every vision check goes through `senses.look` and every "can this eat that"
through `diet.canEat`, so there is exactly one place either rule can be wrong.

### The spatial index (`src/spatial.ts`)

Perception and collisions both start from a quadtree (`@amatiasq/quadtree`) built
from the same snapshot `step` perceives from.

Measured against `3b2028b1^` (the brute-force version) — both trees driven by the
same seeded `Math.random`, so they run the identical world tick by tick, and they
end each case on the same entity count and the same total energy:

| entities | brute force | quadtree | |
| --- | --- | --- | --- |
| 55 | 0.25 ms/tick | 0.15 | ×1.6 |
| 323 | 4.54 | 0.56 | ×8.2 |
| 789 | 21.06 | 1.27 | ×16.5 |
| 1751 | 90.19 | 2.77 | ×32.5 |

So it is real, and the win grows with the crowd — as an O(n²) → O(n log n) change
should. It is worth almost nothing on one screenful, where a tick was already a
quarter of a millisecond: the reason to keep it is that a big monitor holds a
thousand cells and 19 ms a tick means the browser cannot hit 60 fps while doing
anything else. **`d` shows the live ms/tick**, so this is checkable without a
harness — but a headless bench beats reading the panel for a comparison, because
the panel's number includes the timeline's deep copy of every frame.

It is a **broad phase and nothing else**: it answers with a superset and the
caller keeps its own predicate, because the tree's questions are rectangular and
this world's are circular and toroidal. `senses.look` still decides what is in
range and `collision.resolveCollisions` still decides what overlaps.

The wrap is handled by splitting the query at the seams — a reach running off the
right edge is asked again on the left, so a corner query becomes four boxes. Get
this wrong and nothing crashes; cells simply go blind near the borders. User story
14 compares the index against a brute-force scan, edge-hugging layouts included.

**The root is the world**, widened only if something strayed outside it (a
`Quadnode` throws on an entity its root does not contain). It used to be the
bounding box of the entities, which moves a pixel or two every tick: every
quadrant line drifts, and a cell changes quadrant because a different cell walked
towards an edge. Same answers either way, which is why it survived until the
overlay drew the grid and it crawled. It costs ~10% a tick — the boxes no longer
hug the crowd — and it is worth it.

`resolveCollisions` pads its queries (`broadPhaseReach`) because separating a pair
moves it while the pass is still running and the index was frozen before that. A
missed pair costs one tick — they are still overlapping next tick.

## Time is steppable, and that constrains the code

`←` and `→` walk the simulation a frame at a time through `HISTORY_SIZE` frames of
recorded past. Two consequences, both easy to break:

- **Frames are deep copies.** `step()` mutates the entities it is given and
  returns those same objects, so a frame stored by reference would keep moving and
  "the past" would be a copy of the present. `timeline.ts` clones before advancing.
- **Going forward after going back REPLAYS.** It does not recompute: mitosis
  angles and plant seeding are random, so recomputing would hand back a different
  frame and stepping back and forth would not land where you started. That is also
  why seeding happens inside the timeline's advance rather than after it.

`controls.ts` holds no DOM: the page turns keydown into `press()` and
`requestAnimationFrame` into `frame()`. Keyboard behaviour is unreachable from a
browser automation harness, so the logic lives where a spec can reach it and the
wiring stays trivial.

## The invariants

None of these crash when broken — they make the simulation quietly wrong.

### 1. Distance is toroidal, everywhere

The map wraps on both axes. Every distance, every "is it in my vision", every
"which is the nearest herbivore" uses the **shortest wrapped distance**, not
`hypot(dx, dy)`.

```
dx = abs(a.x - b.x); if (dx > width  / 2) dx = width  - dx
dy = abs(a.y - b.y); if (dy > height / 2) dy = height - dy
```

The direction vector wraps too, or a cell chases the *long way round* toward prey
that is just over the edge, and flees in the wrong direction. A cell 2px from the
right edge must see across to the left edge.

### 2. Eating needs the right type *and* a bigger size

Two predicates, both required. Do not collapse them into one.

**Type — is it on my menu at all?**

| eater | can eat |
| --- | --- |
| herbivore | plants |
| carnivore | herbivores; other carnivores (only when no herbivore is in range) |

Herbivores never eat herbivores. Carnivores never eat plants.

**Size — strictly bigger.** `a` eats `b` only if `a.size > b.size`. **Equal sizes
do not eat**: two identical cells may overlap, touch and separate with nothing
happening. Any `>=` here becomes a coin-flip decided by iteration order, and the
population dynamics change completely.

**Fear is the same predicate, inverted.** A cell flees `x` exactly when `x` could
eat it — `x`'s diet includes my type **and** `x.size > my.size`. One function, used
by both the threat scan and the eat resolution, or the two drift apart and cells
run from things that cannot touch them. The four cases it must produce:

- herbivore vs bigger herbivore → **no flee** (not on its menu)
- herbivore vs bigger carnivore → **flee**
- carnivore vs bigger herbivore → **no flee** (not on its menu)
- carnivore vs bigger carnivore → **flee**

A size-only threat check passes both "flee" cases and silently fails both "no
flee" ones: herbivores stampede from each other and carnivores dodge their own
prey. It looks like bad tuning, not a bug.

### 3. Herbivore priority: flee first

A herbivore that sees both a plant and a threat goes for survival. This is a
priority, not a blend — summing "toward plant" and "away from carnivore" as equal
forces starves the herbivore standing still between them, or drifts it into the
predator. Fleeing dominates while a threat is in range.

**It applies to carnivores too** (`behavior.decide` runs the threat scan first for
every animal): the reasoning is about blending forces and holds identically for a
small carnivore that meets a big one mid-hunt.

### 4. Carnivore fallback order: herbivore, then carnivore

Nearest herbivore in `CARNIVORE_VISION_RANGE` wins. Only when there is none does a
carnivore consider another carnivore, and then invariant 2 still applies, so only
a *smaller* one.

Note the asymmetry: the herbivore target is **not** filtered by size. A carnivore
commits to the nearest one and a chase it is too small to finish costs it the area
it burned. That is also the mechanism that kills a carnivore which has shrunk
below the herbivore size band.

### 5. Eating is a transfer over time, and area is conserved

Eating moves **area**, not radius. A 10 px² plant makes the eater 10 px² bigger.
Convert through area (`area = π r²`), never add radii.

It drains over several ticks (~5 for a big plant), so:
- the prey shrinks as the predator grows, in the same step;
- the transfer must survive the prey being finished off — clamp at zero and remove;
- something must handle the eater dying or splitting mid-meal.

### 6. Mitosis halves the radius, which quarters the area

At max size a cell splits, each child getting **half the parent's radius**. The two
children together hold **half** the parent's area, not all of it:
`2 × π(r/2)² = πr²/2`. The loss is intentional — it is the energy sink balancing
plants feeding the system. Do not "fix" it to conserve area; that removes the only
brake on population growth and the sim runs away.

Children leave in opposite directions, far enough apart not to re-collide.

### 7. Movement costs area, and speed makes it cost more

Every cell loses a little area on every tick it moves, scaled by speed. Small per
tick, never stops. This is the mechanism that makes the sim an ecosystem:

- **no plants ⇒ herbivores shrink to nothing.** A good first integration test: run
  with plant growth at zero and assert the herbivore population reaches zero.
- a carnivore that never catches anything starves the same way;
- chasing is expensive, so a long hunt can cost more than the prey is worth.

**It is QUADRATIC**: `cost = MOVEMENT_ENERGY_FACTOR × speed²`, chosen over linear
because it punishes sprinting and rewards the predator that waits. Changing it is
a design change, not a tuning tweak — `life.burnMovementEnergy` is the only place
it lives.

Watch the interaction with eating: a cell losing area while draining a plant is
fine, but the two must not let area go negative in the same tick. Clamp at zero
and remove the cell.

### 8. Energy budget

**One source: plants. Two sinks: mitosis and movement.** The whole behaviour of
the simulation is the ratio between them, so a third term of either kind (decay,
starvation timers, spontaneous generation, a cost for being eaten) must be declared
**here** — an undocumented term turns every tuning session into a guess.

- **Plants grow** at `PLANT_GROWTH_RATE` area/tick up to `PLANT_MAX_AREA`. The
  source.
- **Seedlings appear** every `PLANT_SEED_INTERVAL` ticks at a random spot, at
  `PLANT_INITIAL_SIZE`, while there are fewer than `PLANT_MAX_COUNT` plants. Part
  of the plant source; ~7 px² each, so not meaningful free energy, but it is what
  stops a grazed-flat world from being permanently dead. It lives in
  `simulation.ts`, NOT in `step()`, so a tick stays deterministic for the tests.
- **Mitosis** loses half the parent's area. Sink.
- **Movement** burns `factor × speed²`. Sink.

Nothing else creates or destroys area. Eating only moves it.

### 9. Cells are solid, except where eating needs them not to be

Two cells cannot stand in the same place. `collision.resolveCollisions` runs once
per tick, AFTER everyone has moved (resolving overlaps as they appear gives whoever
is early in the array a free shove), and pushes each of the pair half the overlap
apart.

**Only the velocity ALONG the line between them is traded**, damped by
`COLLISION_FRICTION`; sideways speed is untouched, so cells slide past each other
and only head-on hits cost anything. Swapping whole vectors instead makes the sim
feel sluggish — in a herd cells are in near-continuous contact and every graze
costs half the speed (2.2 px/tick average against a 3.6 limit, 2.7 with the
along-the-line trade). If it ever feels slow again, measure the average speed
before looking at the frame time; `step()` costs ~0.2 ms a tick.

**Two exemptions, both load-bearing:**

- **A pair where one can eat the other passes through.** Eating is gated on
  `isTouching`, so a solid predator would shove its meal away the instant it caught
  it and could never take a second bite. Overlap between an eater and its food is a
  meal in progress, not a collision.
- **Plants are not solid at all.** A herbivore has to sit on one to drain it.

So the pairs that DO collide are exactly the ones `canEat` rejects in both
directions: same species (including equal sizes) and a carnivore against a
herbivore too big for it. Change the first exemption and the food chain silently
stops working — cells look like they are eating and nothing shrinks.

### 10. Flocking is what a cell does with its spare time

Boids (alignment + cohesion + separation) live in `flock.ts` behind two rules:

- **Same species only.** A herbivore that aligns with a carnivore steers itself
  into its own predator.
- **Idle only.** `decide` reaches flocking only after the threat scan and the prey
  scan both came up empty, so it is never summed with fleeing or hunting — that is
  invariant 3 again. `FLOCKING_FORCE` is also well under `HUNT_FORCE`.

**Herbivores herd; carnivores only separate.** Cohesion for carnivores halves
their survival rate over 40 000 ticks: a pack hunts the same herd, splits the same
meal and burns the same area doing it.

Herding is not free — it clumps the prey, so a carnivore crossing an empty patch
finds nothing. That is why `CARNIVORE_VISION_RANGE` is as high as it is. If you
strengthen `FLOCKING_COHESION_FACTOR`, re-check carnivore survival before assuming
it looks nicer.

## Naming

**`size` is always a radius; the map is `worldSize`.** `Entity.size` is a number,
the radius, what the spec means by size when it decides who eats whom; the map's
dimensions are a `Vector`. They turn up in the same functions, so a parameter
called plain `size` tells you nothing about which one you hold. Every world
dimension is `worldSize`, including `World.worldSize`.

Use `HERBIVORE_*`, not `HERVIVORE_*` — the Spanish *herbívoro* leaks the wrong
spelling in. Archived versions have it as `hervivore`, so grep for both spellings
when searching history.

## The constants file

**One file. Constants and nothing else.** No logic, no helpers, no values computed
from other modules — a flat list of named numbers, readable at a glance.

The tuning loop is "change a number, watch, change it again", dozens of times in a
sitting. Anything else in that file makes that loop worse, and a constant computed
elsewhere means the value you read is not the value that runs.

### Populations are densities

`PLANTS_PER_SCREEN` and friends are counts **per reference screen**
(`REFERENCE_WIDTH` × `REFERENCE_HEIGHT`, the 1440×900 everything was tuned on),
scaled by area in `populate`. The plant cap and the seeding interval scale the same
way — twice the world needs twice the seedlings to hold one density.

`viableWorld` puts a floor under it: a canvas below `MIN_WORLD_SCREENFULS` gets a
**bigger world drawn scaled down** rather than a proportionally tiny population.
Small populations die of their own randomness and no tuning fixes that — measured
over 25k ticks, a phone-sized world (0.21 screenfuls) lost everything in 2 runs of
3, while 0.42 survived 3 of 3. The aspect ratio is preserved so the render scale is
one number.

An explicitly passed `worldSize` is left alone: the floor only applies when the
world is derived from a canvas, so specs stay in control of their world.

### Tuning, and the one trap in it

The knobs are not independent, and one pairing decides whether the simulation has
three species or two:

**`HERBIVORE_MITOSIS_SIZE` sets the herbivore size band** — they live between half
of it and all of it. **A carnivore under that band has an empty menu**: it can see
and chase herbivores (invariant 4) but cannot eat any of them, so it burns area
until it dies. So `CARNIVORE_INITIAL_SIZE` and half of `CARNIVORE_MITOSIS_SIZE`
both have to sit above `HERBIVORE_MITOSIS_SIZE`, with room to spare for the area a
carnivore loses between kills.

The margin is not a rounding detail. At `CARNIVORE_MITOSIS_SIZE = 24` the children
land at 12 against a herbivore band topping out at 11, and carnivores died in 8
runs out of 8. At 28 — children at 14 — they survive 6 of 8. Nothing else changed.

The failure mode is not a crash: carnivores shrink steadily and are gone by tick
~1500, reading exactly like "predators are slightly too weak".

The current values survive 40 000 ticks (≈11 minutes at 60 fps) with all three
populations oscillating in most runs; carnivores are the fragile one and are lost
in roughly a quarter. Judge a change by the rate over several runs, never by one.
Tuning is a headless loop — `step()` takes an entity array and a world, so a script
that runs it 40 000 times and prints population counts every 250 ticks tells you
more in two seconds than watching the canvas does in ten minutes.

**Undeclared checks stay undeclared.** `isFamily` (relatives never eat each other)
exists in all three archived versions and is deliberately NOT here: children of a
split are exactly the same size, and the equal-size rule already stops them eating
each other.

## The frozen versions, served at `/2014` and `/2026`

`amq/amq-lulas-build-versions` copies `recover/js-2014` into `dist/2014/` so the
original simulation runs next to the current one (no bundler — plain JS that
RequireJS loads at runtime), and bundles `versions/2026/` into `dist/2026/`, a
frozen copy of the current sources for later comparison. Details:
[`versions/README.md`](versions/README.md).

The 2014 tree needs two files the archived commit does not contain, and they live
in `versions/2014/` because nothing may be added to `recover/`: RequireJS itself
and `src/ticker.js`, without which `main.js` 404s and nothing starts.

The copy also gets `versions/2014/on-black.html` injected before `</body>`: any
query string or hash (`/2014/?a`, `/2014/#a`) repaints its canvas black, so it can
be compared against the current simulation without one of the two being inverted.
Injecting into the copy is fine; editing the archive is not.

`ts-2018` and `ts-2020` are deliberately NOT deployed: they have no species, so
there is nothing to watch. They are kept for the shape of the code.

## Offline

`amq/amq-lulas-build-sw` walks `dist/` after `vite build` and emits a `sw.js` that
precaches everything — including `/2014` — with the cache name hashed from the file
list. Chained into `bun run build` after `build-versions`, so it sees what that
emitted; `src/index.ts` registers it behind `import.meta.env.PROD`.

Two rules exist because of `/2014` and both fail silently if broken: every
`index.html` is cached under its **directory** URL as well as its file URL (a
navigation asks for `/2014/`, never `/2014/index.html`), and the offline navigation
fallback picks the **nearest** shell, so `/2014/` can never boot the current
simulation. RequireJS's `urlArgs` cache-busting is harmless because the fetch
handler matches with `ignoreSearch: true`.

## Deployment

**https://lulas.amatiasq.com** (and `lulas.amq.im`), the sanremo pattern: an nginx
image with the built site baked in, pushed to `docker.amatiasq.com`, recreated on
the VPS.

```sh
amq lulas deploy      # buildx (linux/amd64) + push + deploy-infra + pull-and-restart
```

- `Dockerfile` builds with Bun and copies `dist/` into `nginx:alpine`. The version
  copy and the service worker are generated **inside** the image, so `recover/` and
  `versions/` must stay in the build context — `.dockerignore` keeps the rest out.
- `nginx.conf` — hashed `/assets/*.js|css` immutable for a year; `/sw.js` and all
  of `/2014/` `no-cache`, because those are served under names that never change
  and a redeploy has to reach people.
- `infra/compose.yml` is the source of truth for the stack. Rolling back is pinning
  an older timestamp tag there.
- DNS is declared via `amq dns add lulas` (both zones). Do not hand-edit
  `dns/shared.ts`.

The folder is mirrored to `amatiasq/lulas` by
`.github/workflows/push-to-lulas.yml`, which is the archive `recover/` came out of
— never force-push or prune that repo.
