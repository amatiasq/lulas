# lulas — AGENTS.md

Predator/prey ecosystem simulation on a map that wraps on both axes. This file
is the spec: the glossary and the invariants, none of which crash when broken —
they make the simulation quietly wrong, so each carries the reason it exists.

`recover/` (`js-2014`, `ts-2018`, `ts-2020`) and `versions/` are a **closed
archive**: read them, port from them, never lint, format, build on or **add a
file to** them. Scorecard: [`recover/README.md`](recover/README.md).

## Glossary

- **Cell** — any entity: a plant, a herbivore or a carnivore. All circles.
- **size** — always a RADIUS in pixels, and what the spec means when it decides
  who eats whom. The map's dimensions are always **`worldSize`**, a `Vector`,
  never `size`: the two meet in the same functions, and a bare `size` parameter
  tells you nothing about which one you are holding.
- **energy** — area, `π·size²`, derived from `size` and never stored. One field
  for both makes "eating transfers area", "movement burns area" and "mitosis
  loses half the area" arithmetic on the same number.
- **energy budget** — **one source, plants; two sinks, mitosis and movement.**
  The whole behaviour of the simulation is the ratio between them, so any third
  term of either kind (decay, a starvation timer, spontaneous generation, a cost
  for being eaten) must be declared in invariant 8; an undeclared one turns every
  tuning session into a guess. Eating creates nothing, it only moves area.
- **movement cost** — the area a cell burns per tick it moves, `FACTOR × speed²`.
- **mitosis** — a cell past its threshold becomes exactly two children of half
  its radius, shoved in opposite directions.
- **toroidal distance** — the shortest distance across the wrap, never
  `hypot(dx, dy)`. Every vision check goes through `senses.look` and every "can
  this eat that" through `diet.canEat`, so there is exactly one place either rule
  can be wrong.
- **solid** — two cells cannot stand in the same place. Plants never are, and
  neither is a predator/prey pair.
- **herd / pack** — boids among cells of the same type, and only when idle.
  Herbivores herd; carnivores get separation only.
- **screenful** — the unit populations are counted in. Every population is a
  DENSITY per `REFERENCE_WIDTH × REFERENCE_HEIGHT` (1440×900, what everything was
  tuned on) scaled by area, so a phone and an 8K monitor get the same crowding
  rather than the same fifty cells adrift in very different spaces.
- **broad phase** — what the quadtree answers: a superset of candidates, never an
  answer. Its questions are rectangular, this world's are circular and toroidal,
  so the caller keeps its own predicate.
- **snapshot** — the deep copy `step` takes before anything moves. Everyone
  perceives it, so a cell reacts to the frame it saw and not to a world
  half-updated by whoever came earlier in the array.
- **frame / behind** — the timeline keeps `HISTORY_SIZE` past frames; `behind` is
  how many of them the view is back from the newest.

## The invariants

1. **Distance is toroidal, everywhere** — every distance, every "is it in my
   vision", every "which is nearest". The DIRECTION wraps too, or a cell chases
   the long way round after prey just over the edge, and flees the wrong way.
2. **Eating needs the right type AND a strictly bigger size.** Two predicates,
   both required, never collapsed. **Equal sizes do not eat**: any `>=` becomes a
   coin flip decided by iteration order and the population dynamics change
   completely. **Fear is the same predicate inverted** — one function for the
   threat scan and the eat resolution, or the two drift apart. It has to produce
   all four cases: a herbivore does not flee a bigger herbivore but does flee a
   bigger carnivore; a carnivore does not flee a bigger herbivore but does flee a
   bigger carnivore. A size-only threat check passes both "flee" cases and
   silently fails both "no flee" ones, so herbivores stampede from each other and
   carnivores dodge their own prey. It reads as bad tuning, not as a bug.
3. **Flee first, always.** A threat in vision wins outright over food: a
   priority, not a blend, because summing "toward the plant" and "away from the
   carnivore" starves the herbivore standing still between them or drifts it into
   the predator. **It applies to carnivores too** — the argument is about summing
   forces and does not care about species.
4. **Carnivore fallback order: herbivore, then carnivore.** Only with no
   herbivore in range does a carnivore consider a (smaller, per 2) carnivore.
   Note the asymmetry: the herbivore target is **not** filtered by size. A
   carnivore commits to the nearest one and a chase it is too small to finish
   costs it the area it burned — which is also what kills a carnivore that has
   shrunk below the herbivore size band.
5. **Eating is a transfer of AREA, over several ticks.** A 10 px² plant makes the
   eater 10 px² bigger: convert through `area = π r²`, never add radii. It drains
   over ~5 ticks for a big plant, so the prey shrinks as the predator grows in the
   same step, the transfer survives the prey being finished off (clamp at zero and
   remove), and the eater may die or split mid-meal.
6. **Mitosis halves the radius, which quarters the area.** Two children at half
   the parent's radius hold **half** its area together: `2 × π(r/2)² = πr²/2`. The
   loss is the sink balancing the plants — "fixing" it to conserve area removes
   the only brake on population growth and the sim runs away. Children leave in
   opposite directions, far enough apart not to re-collide.
7. **Movement costs area, QUADRATICALLY in speed**, and
   `life.burnMovementEnergy` is the only place that lives. Quadratic over linear
   because it punishes sprinting and rewards the predator that waits — changing
   it is a design change, not a tuning tweak. It is what makes this an ecosystem:
   **plant growth at zero ⇒ the herbivore population reaches zero**, the
   integration test worth having; a carnivore that never catches anything starves
   the same way; a long hunt can cost more than the prey is worth. Draining a
   plant while burning area is fine, but the two must not take area negative in
   the same tick.
8. **The energy budget is closed** (see the glossary). The two declared extras
   are `PLANT_SEED_INTERVAL` — part of the plant source, ~7 px² a seedling, so
   not meaningful free energy, but growth is multiplicative on existing plants
   and without it a grazed-flat world is permanently dead — and
   `PLANT_LIMIT_PER_SCREEN`, a density cap rather than an energy term. Both live
   in `simulation.ts`, NOT in `step()`, so a tick stays deterministic for specs.
9. **Cells are solid, except where eating needs them not to be.**
   `resolveCollisions` runs once per tick AFTER everyone has moved — resolving
   overlaps as they appear gives whoever is early in the array a free shove.
   **Only the velocity ALONG the line between them is traded**, damped by
   `COLLISION_FRICTION`, so cells slide past each other and only head-on hits
   cost anything. Swapping whole vectors makes the sim feel sluggish: in a herd
   cells are in near-continuous contact and every graze costs half the speed —
   **2.2 px/tick average against a 3.6 limit, versus 2.7 with the along-the-line
   trade.** If it feels slow again, measure the average speed before the frame
   time; `step()` costs ~0.2 ms a tick.
   **Two exemptions, both load-bearing**: a pair where one can eat the other
   passes through, because eating is gated on `isTouching` and a solid predator
   would shove its meal away before the second bite; and plants are not solid at
   all, because a herbivore has to sit on one to drain it. So the pairs that DO
   collide are exactly the ones `canEat` rejects in both directions. Change the
   first exemption and the food chain silently stops working — cells look like
   they are eating and nothing shrinks.
10. **Flocking is what a cell does with its spare time.** Same species only (a
    herbivore that aligns with a carnivore steers into its own predator) and idle
    only (`decide` reaches it after both scans came up empty, so it is never
    summed with fleeing or hunting — invariant 3 again). **Herbivores herd;
    carnivores only separate:** cohesion for carnivores halves their survival
    rate over 40 000 ticks, because a pack hunts the same herd, splits the same
    meal and burns the same area doing it. Herding is not free either — it clumps
    the prey, which is why `CARNIVORE_VISION_RANGE` is as high as it is, so
    strengthening `FLOCKING_COHESION_FACTOR` means re-checking carnivore survival.

## Tuning, and the trap in it

`src/CONFIGURATION.ts` is **one file, constants and nothing else** — no logic, no
helpers, no value computed from another module. The tuning loop is "change a
number, watch, change it again", dozens of times in a sitting, and a constant
computed elsewhere means the value you read is not the value that runs.

The knobs are not independent, and one pairing decides whether the simulation has
three species or two. **`HERBIVORE_MITOSIS_SIZE` sets the herbivore size band** —
they live between half of it and all of it — and **a carnivore under that band
has an empty menu**: it sees and chases herbivores (invariant 4) but can eat none
of them, so it burns area until it dies. `CARNIVORE_INITIAL_SIZE` and half of
`CARNIVORE_MITOSIS_SIZE` both have to sit above `HERBIVORE_MITOSIS_SIZE`, with
room for what a carnivore loses between kills.

**The margin is not a rounding detail. At `CARNIVORE_MITOSIS_SIZE = 24` the
children land at 12 against a herbivore band topping out at 11, and carnivores
died in 8 runs out of 8. At 28 — children at 14 — they survive 6 of 8.** Nothing
else changed. The failure mode is not a crash: carnivores shrink steadily and are
gone by tick ~1500, reading exactly like "predators are slightly too weak".

The current values survive 40 000 ticks (≈11 minutes at 60 fps) with all three
populations oscillating in most runs; carnivores are the fragile one and are lost
in roughly a quarter. Judge a change by the rate over several runs, never by one.
**Tune headlessly** — `step()` takes an entity array and a world, so a script
that runs it 40 000 times and prints populations every 250 ticks tells you more
in two seconds than the canvas does in ten minutes.

**Undeclared checks stay undeclared.** `isFamily` (relatives never eat each
other) exists in all three archived versions and is deliberately NOT here: the
children of a split are exactly the same size, and the equal-size rule already
stops them eating each other.

## The spatial index

Measured against `3b2028b1^` (brute force), both trees driven by the same seeded
`Math.random` so they run the identical world tick by tick and end on the same
entity count and total energy:

| entities | brute force | quadtree | |
| --- | --- | --- | --- |
| 55 | 0.25 ms/tick | 0.15 | ×1.6 |
| 323 | 4.54 | 0.56 | ×8.2 |
| 789 | 21.06 | 1.27 | ×16.5 |
| 1751 | 90.19 | 2.77 | ×32.5 |

The win grows with the crowd, as O(n²) → O(n log n) should, and is worth almost
nothing on one screenful. The reason to keep it is that a big monitor holds a
thousand cells, where 19 ms a tick means no 60 fps. **`d` shows the live
ms/tick**, but a headless bench beats reading the panel, whose number includes
the timeline's deep copy of every frame.

**The root is the world**, widened only if something strayed outside it
(`Quadnode` throws on an entity its root does not contain). **Never the bounding
box of the entities**: that box moves a pixel or two every tick, so every
quadrant line drifts and a cell changes quadrant because a *different* cell
walked towards an edge. The answers are the same either way — it shows up only as
a crawling grid in the **D** overlay. A world-sized root costs ~10% a tick and is
worth it. The wrap is handled by splitting a query at the seams, so a corner
query becomes four boxes; get it wrong and nothing crashes, cells simply go blind
near the borders, which is what user story 14 pins against a brute-force scan.

## Time is steppable, and that constrains the code

- **Frames are deep copies.** `step()` mutates the entities it is given and
  returns those same objects, so a frame stored by reference would keep moving
  and "the past" would be a copy of the present.
- **Going forward after going back REPLAYS.** It does not recompute: mitosis
  angles and plant seeding are random, so recomputing would hand back a different
  frame and stepping back and forth would not land where you started. That is
  also why seeding happens inside the timeline's advance rather than after it.
- **`controls.ts` holds no DOM.** Keyboard behaviour is unreachable from a
  browser automation harness, so the logic lives where a spec can reach it and
  the page only turns keydown into `press()` and rAF into `frame()`.

## The frozen versions at `/2014` and `/2026`

Built by `amq/amq-lulas-build-versions`; details in
[`versions/README.md`](versions/README.md). Everything the 2014 tree needs but
the archived commit lacks lives in `versions/2014/`, because nothing may be added
to `recover/`: RequireJS, `src/ticker.js` (without which `main.js` 404s), and
`on-black.html`, injected into the *copy* so any query string or hash repaints
its canvas black and the two simulations can be compared without one of them
being inverted. `ts-2018` and `ts-2020` are deliberately not deployed: no
species, nothing to watch.

Two rules in the generated `sw.js` exist because of `/2014` and both fail
silently: every `index.html` is cached under its **directory** URL as well as its
file URL (a navigation asks for `/2014/`, never `/2014/index.html`), and the
offline navigation fallback picks the **nearest** shell, so `/2014/` can never
boot the current simulation.

## Deployment

**https://lulas.amatiasq.com** (and `lulas.amq.im`), the sanremo pattern. Two
things are specific to here: the version copy and the service worker are
generated **inside** the image, so `recover/` and `versions/` must stay in the
build context; and `nginx.conf` serves `/sw.js` and all of `/2014/` `no-cache`,
because those are served under names that never change and a redeploy has to
reach people. The folder is mirrored to `amatiasq/lulas`, which is the archive
`recover/` came out of — never force-push or prune that repo.

History: [`.agents/decisions/`](.agents/decisions).
