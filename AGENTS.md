# lulas — AGENTS.md

Predator/prey ecosystem simulation: plants, herbivores, carnivores, size-based
eating, mitosis, on a toroidal map. Human-facing spec and the narrative version:
[`README.md`](README.md). This file is the same rules stated as things you can
implement and test, plus the traps.

## Current state

**Built and running** (2026-08-01), at this folder's root: Bun + Vite + Vitest,
toolchain copied from [`../flocking/`](../flocking/), specs in `user-stories/`.
`amq lulas dev | test | build | check`.

Three older versions are archived in [`recover/`](recover/): `js-2014`,
`ts-2018`, `ts-2020`. The rules came from `js-2014`, the shape from `ts-2020` —
[`recover/README.md`](recover/README.md) has the rule-by-rule scorecard,
[`.agents/decisions/2026-08-01 recovery-outcome.md`](.agents/decisions/2026-08-01%20recovery-outcome.md)
says why, and
[`.agents/decisions/2026-08-01 build-outcome.md`](.agents/decisions/2026-08-01%20build-outcome.md)
records what the build actually did.

`recover/` is a **closed archive**: verbatim trees kept as evidence. Do not lint,
format or upgrade them, and do not build on top of them in place.

## Where things live

One concern per file; none of them is big.

| file | what is in it |
| --- | --- |
| `src/CONFIGURATION.ts` | every tunable number, and nothing else |
| `src/world.ts` | the toroidal map: `shortestDelta`, `shortestDistance`, `wrapPosition` |
| `src/vector.ts` | plain vector maths |
| `src/entity.ts` | the entity, per-type stats, and `energy ⇄ size` |
| `src/diet.ts` | `canEat` / `flees` — invariant 2, in one place |
| `src/senses.ts` | `look` and `nearest`, both toroidal |
| `src/behavior.ts` | `decide` — flee, else hunt/eat, else flock, else coast |
| `src/flock.ts` | boids, same species only, idle only |
| `src/collision.ts` | solid bodies: nothing stands inside anything else |
| `src/life.ts` | `bite`, `grow`, `move`, `burnMovementEnergy`, `split` |
| `src/step.ts` | one tick: perceive from a snapshot, act, move, split, bury |
| `src/render.ts` | canvas drawing, wrap-aware |
| `src/simulation.ts` | wires it to a canvas, spawns the world, seeds plants |

Every vision check goes through `senses.look`, and every "can this eat that"
through `diet.canEat`, so there is exactly one place either rule can be wrong.

## History, so the names make sense

There have been several versions of this simulation, going back to 2014 (plain
JS, Grunt/Karma), migrated to TypeScript around 2017. At some point the author
restarted from scratch to make flocking behaviour easier to implement, and *that*
rewrite kept the `lulas` name while the predator/prey code was left behind on
branches.

In 2026 the rewrite was renamed [`flocking/`](../flocking/) — what it actually
is — and `lulas` returned to this, the original simulation. So:

- **`flocking/`** — boids. Alignment, cohesion, separation. Live code.
- **`lulas/`** — this. Plants, herbivores, carnivores, eating, mitosis. To recover.

The standalone repo `amatiasq/lulas` still holds the old predator/prey code in
its history. See the recovery plan for exact refs.

## The invariants

These are the things that are easy to get subtly wrong and expensive to debug,
because none of them crash — they just make the simulation quietly wrong.

### 1. Distance is toroidal, everywhere

The map wraps on both axes. Every distance, every "is it in my vision", every
"which is the nearest herbivore" must use the **shortest wrapped distance**, not
`hypot(dx, dy)`.

```
dx = abs(a.x - b.x); if (dx > width  / 2) dx = width  - dx
dy = abs(a.y - b.y); if (dy > height / 2) dy = height - dy
```

The direction vector has to wrap too, or a cell will chase the *long way round*
toward prey that is actually just over the edge, and flee in the wrong direction.
A cell 2px from the right edge must see across to the left edge. This is the
single most likely thing to be missing in recovered code — check it first.

### 2. Eating needs the right type *and* a bigger size

Two predicates, both required. Do not collapse them into one.

**Type — is it on my menu at all?**

| eater | can eat |
| --- | --- |
| herbivore | plants |
| carnivore | herbivores; other carnivores (only when no herbivore is in range) |

Herbivores never eat herbivores. Carnivores never eat plants.

**Size — strictly bigger.** Among cells, `a` eats `b` only if `a.size > b.size`.
**Equal sizes do not eat.** Two identical cells may overlap, touch and separate
with nothing happening. Any `>=` here becomes a coin-flip decided by iteration
order, and the population dynamics change completely.

**Fear is the same predicate, inverted.** A cell flees `x` exactly when `x` could
eat it — `x`'s diet includes my type **and** `x.size > my.size`. Express it that
way, as one function used by both the threat scan and the eat resolution, or the
two will drift apart and cells will run from things that cannot touch them.

That single rule produces all four cases, and it is worth checking a recovered
implementation against each one:

- herbivore vs bigger herbivore → **no flee** (not on its menu)
- herbivore vs bigger carnivore → **flee**
- carnivore vs bigger herbivore → **no flee** (not on its menu)
- carnivore vs bigger carnivore → **flee**

A size-only threat check passes the two "flee" cases and silently fails the two
"no flee" ones: herbivores stampede from each other and carnivores dodge their
own prey. It looks like bad tuning, not a bug.

### 3. Herbivore priority: flee first

A herbivore with both a plant in vision and a threat in vision goes for
survival. This is a priority, not a blend — if you sum "toward plant" and "away
from carnivore" as equal forces, a herbivore starves itself standing still
between the two, or worse, drifts into the predator. Fleeing dominates while a
threat is in range; foraging resumes when it is not.

**It applies to carnivores too** (`behavior.decide` runs the threat scan first
for every animal). The spec only demands it of herbivores, but the reasoning is
about blending forces and holds identically for a small carnivore that meets a
big one mid-hunt.

### 4. Carnivore fallback order: herbivore, then carnivore

Nearest herbivore in `CARNIVORE_VISION_RANGE` wins. Only when there is none does
a carnivore consider another carnivore — and then invariant 2 still applies, so
it only goes for a *smaller* one.

Note the asymmetry: the herbivore target is **not** filtered by size. A carnivore
commits to the nearest one and a chase it is too small to finish costs it the
area it burned. That is the spec, and it is also the mechanism that kills a
carnivore which has shrunk below the herbivore size band.

### 5. Eating is a transfer over time, and area is conserved

Eating moves **area**, not radius. A 10 px² plant makes the eater 10 px² bigger.
Convert through area (`area = π r²`), never add radii.

It drains over several ticks (~5 for a big plant), so:
- the prey shrinks as the predator grows, in the same step;
- the transfer must survive the prey being finished off — clamp at zero and
  remove;
- something must handle the eater dying or splitting mid-meal.

### 6. Mitosis halves the radius, which quarters the area

At max size a cell splits. Each child gets **half the parent's radius**.

That means the two children together hold **half** the parent's area, not all of
it: `2 × π(r/2)² = πr²/2`. The loss is intentional — it is the energy sink that
balances plants feeding the system. Do not "fix" it to conserve area; that
removes the only brake on population growth and the sim runs away.

Children leave in opposite directions. Any axis, but opposed, and far enough
apart not to immediately re-collide.

### 7. Movement costs area, and speed makes it cost more

Every cell loses a little area on every tick it moves, scaled by how fast it is
going (`movement energy factor`). It is small per tick and never stops.

This is not decoration — it is the mechanism that makes the sim an ecosystem:

- **no plants ⇒ herbivores shrink to nothing.** That is a testable property, and
  a good first integration test: run with plant growth at zero and assert the
  herbivore population reaches zero.
- a carnivore that never catches anything starves the same way;
- chasing is expensive, so a long hunt can cost more than the prey is worth.

**It is QUADRATIC**: `cost = MOVEMENT_ENERGY_FACTOR × speed²`. Chosen over linear
because it punishes sprinting and rewards the predator that waits. Changing it is
a real design change, not a tuning tweak — `life.burnMovementEnergy` is the only
place it lives.

Watch the interaction with **eating**: a cell losing area while draining a plant
is fine, but the two must not fight over the same field in the same tick in a way
that lets area go negative. Clamp at zero and remove the cell.

### 8. Energy budget

**One source: plants. Two sinks: mitosis and movement.** The entire behaviour of
the simulation is the ratio between them, so if you add a third term of either
kind (decay, starvation timers, spontaneous generation, a cost for being eaten)
say so **here** — an undocumented term turns every tuning session into a guess.

Declared, as of the build:

- **Plants grow** at `PLANT_GROWTH_RATE` area/tick up to `PLANT_MAX_AREA`. The
  source.
- **Seedlings appear** every `PLANT_SEED_INTERVAL` ticks at a random spot, at
  `PLANT_INITIAL_SIZE`, while there are fewer than `PLANT_MAX_COUNT` plants. It
  is part of the plant source and it is not free energy in any meaningful amount
  (a seedling is ~7 px²), but it is the term that stops a grazed-flat world from
  being permanently dead. It lives in `simulation.ts`, NOT in `step()`, so a tick
  stays deterministic for the tests.
- **Mitosis** loses half the parent's area. Sink.
- **Movement** burns `factor × speed²`. Sink.

Nothing else creates or destroys area. Eating only moves it.

### 9. Cells are solid, except where eating needs them not to be

Two cells cannot stand in the same place: `collision.resolveCollisions` runs once
per tick, AFTER everyone has moved (resolving overlaps as they appear would give
whoever is early in the array a free shove), pushes each of the pair half the
overlap apart and has them trade velocities damped by `COLLISION_FRICTION`.

**Two exemptions, and both are load-bearing:**

- **A pair where one can eat the other passes through.** Eating is gated on
  `isTouching`, so a solid predator would shove its meal away the instant it
  caught it and could never take a second bite. Overlap between an eater and its
  food is a meal in progress, not a collision.
- **Plants are not solid at all.** A herbivore has to sit on one to drain it.

So the pairs that DO collide are exactly the ones `canEat` rejects in both
directions: same species (including the equal sizes the spec describes as
meeting, touching and drifting apart) and a carnivore against a herbivore too big
for it. Change the first exemption and the food chain silently stops working —
cells will look like they are eating and nothing will shrink.

### 10. Flocking is what a cell does with its spare time

Boids (alignment + cohesion + separation), ported from `../flocking/`, live in
`flock.ts` behind two rules that keep them from breaking anything:

- **Same species only.** A herbivore that aligns with a carnivore steers itself
  into its own predator.
- **Idle only.** `decide` reaches flocking only after the threat scan and the
  prey scan both came up empty, so it is never summed with fleeing or hunting.
  That is invariant 3 again: a blended force is what leaves a herbivore drifting
  into the predator. `FLOCKING_FORCE` is also well under `HUNT_FORCE`.

**Herbivores herd; carnivores only separate.** Cohesion for carnivores was tried
and it halved their survival rate over 40 000 ticks — a pack hunts the same herd,
splits the same meal and burns the same area doing it. Predators spread out.

Herding is not free: it clumps the prey, so a carnivore crossing an empty patch
finds nothing. That is why `CARNIVORE_VISION_RANGE` went up when flocking went
in. If you strengthen `FLOCKING_COHESION_FACTOR`, re-check carnivore survival
before assuming it looks nicer.

## Naming

Use `HERBIVORE_*`, not `HERVIVORE_*`. The Spanish *herbívoro* leaks the wrong
spelling into English identifiers, and old versions of this code have it as
`hervivore` in filenames and constants. Normalise on the way in, and grep for
both spellings when searching history.

## The constants file

**One file. Constants and nothing else.** No logic, no helper functions, no
values computed from other modules — a flat list of named numbers, readable at a
glance. `flocking/src/CONFIGURATION.ts` is the shape to copy.

The tuning loop is "change a number, watch, change it again", dozens of times in
a sitting. Anything else living in that file makes that loop worse, and a
constant computed elsewhere means the value you read is not the value that runs.

### Tuning, and the one trap in it

The knobs are not independent, and one pairing decides whether the simulation has
three species or two:

**`HERBIVORE_MITOSIS_SIZE` sets the herbivore size band** — they live between
half of it and all of it. **A carnivore under that band has an empty menu**: it
can still see and chase herbivores (invariant 4), it just cannot eat any of them,
so it burns area until it dies. So `CARNIVORE_INITIAL_SIZE` and half of
`CARNIVORE_MITOSIS_SIZE` both have to sit above `HERBIVORE_MITOSIS_SIZE`, with
room to spare for the area a carnivore loses between kills.

The margin is not a rounding detail. At `CARNIVORE_MITOSIS_SIZE = 24` the
children land at 12 against a herbivore band topping out at 11, and carnivores
died in **8 runs out of 8**. At 28 — children at 14 — they survive 6 out of 8.
Nothing else changed.

Get that wrong and the failure mode is not a crash: carnivores just shrink
steadily and are gone by tick ~1500, and it reads exactly like "predators are
slightly too weak".

The current values survive 40 000 ticks (≈11 minutes at 60 fps) with all three
populations oscillating in most runs — carnivores are the fragile one, and they
are lost in roughly a quarter of them. Judge a change by the rate over several
runs, never by one. Tuning is a headless loop — `step()` takes an entity
array and a world, so a script that runs it 40 000 times and prints population
counts every 250 ticks tells you more in two seconds than watching the canvas
does in ten minutes.

**Undeclared checks stay undeclared.** `isFamily` (relatives never eat each
other) is in all three recovered versions and is deliberately NOT here: children
of a split are exactly the same size, and the equal-size rule already stops them
eating each other. See `README.md` under "Mitosis".

## Offline

`amq/amq-lulas-build-sw` walks `dist/` after `vite build` and emits a `sw.js`
that precaches everything, with the cache name hashed from the file list. It is
chained into `bun run build`, and `src/index.ts` registers it behind
`import.meta.env.PROD`. Not VitePWA/Workbox — nothing here syncs data.

## Deployment

None yet. The folder is mirrored to the standalone repo `amatiasq/lulas` by
`.github/workflows/push-to-lulas.yml`, which is also the archive the `recover/`
trees came out of, so never force-push or prune that repo. Nothing is published
anywhere. Read `.agents/plans/recover.md` before changing any mirror wiring.
