# 2026-08-01 — Build outcome: the simulation runs

Executes [`../plans/build.md`](../plans/build.md), which executes
[`2026-08-01 recovery-outcome.md`](2026-08-01%20recovery-outcome.md).

Built fresh at the folder root, as decided: rules from `recover/js-2014`, shape
from `recover/ts-2020`, toolchain from `../flocking/`. `recover/` was read and
never touched.

`amq lulas check` is green: 63 specs in 8 `user-stories/` files, ~93% statement
coverage, `tsc --noEmit` clean, a 6.4 KB bundle and a generated `dist/sw.js`.

## What was ported, and what was not

| from | taken |
| --- | --- |
| `js-2014/src/map/map.js` | `getShorterDistance` → `world.shortestDelta` |
| `js-2014/src/life/cell.js` | `reproduce` → `life.split`: two children, half radius, opposite ways |
| `js-2014/src/life/plant.js` | growth with a cap → `life.grow` |
| `js-2014` | the palette: dark green plants, light green herbivores, red carnivores |
| `ts-2020/CellBody.ts` | `energy = π·size²` with an inverting setter — the whole model hangs off this |
| `ts-2020/CellDiet.ts` | the type→menu map, and a bite capped at a fraction of the EATER |
| `ts-2020/CellBehavior.ts` | the shape of `interactWithCell` → `behavior.decide` |
| `ts-2020` | the double buffer, as a snapshot taken at the top of `step()` |

Not ported, as flagged in the recovery: `js-2014`'s `eat()` (adds diameters),
`ts-2020`'s `escapeFrom()` (no negation — it flees toward the threat) and
`ts-2020`'s mitosis (conserves energy, can make more than two children).

Written from scratch, because no version had them: movement costing area,
herbivore flee-priority, and the constants file.

## The calls the plan asked to be made deliberately

**`isFamily` is out.** Relatives can eat each other. The reason it was in all
three old versions — a mitosis pair immediately eating each other — is already
covered by the equal-size rule: children of a split are exactly the same size,
and `canEat` needs strictly bigger. There is a spec for it
(`user-stories/6`, last case). Recorded in `README.md` under "Mitosis".

**Movement cost is QUADRATIC**, `MOVEMENT_ENERGY_FACTOR × speed²`. Linear would
have made sprinting cheap; quadratic is what makes waiting a strategy. In
`AGENTS.md` invariant 7 and in `life.burnMovementEnergy`, nowhere else.

**Flee-priority applies to carnivores too**, not only herbivores. The spec only
demands it of herbivores, but the argument (a blend leaves you drifting into the
predator) is about summing forces and does not care about species.

**Carnivores do NOT filter prey by size.** Invariant 4 says the nearest herbivore
wins, so it does, even one too big to eat. A chase it cannot finish costs it the
area it burned — that is the spec's own logic and it turned out to be load
bearing (below).

## Two terms added to the energy budget, both declared

Invariant 8 requires anything extra to be written down; both are in `AGENTS.md`.

- **`PLANT_SEED_INTERVAL`** — a seedling every N ticks. Without it, a grazed-flat
  world is permanently dead: plant growth is multiplicative on existing plants,
  so zero plants stays zero. It is part of the plant source, not a second one.
- **`PLANT_MAX_COUNT`** — seeding stops above it. Found by running 20 000 ticks:
  after the herbivores died the plant count grew without bound forever. A density
  cap, not an energy term.

Both live in `simulation.ts`, not in `step()`, so a tick stays deterministic and
the specs can rely on it.

## The tuning trap, which cost most of the time

The first working build had carnivores extinct by tick 1500, every run, and it
looked like they were simply too weak. They were not — they were **eating
nothing at all**, and shrinking on movement cost alone.

The mechanism: a herbivore lives between half `HERBIVORE_MITOSIS_SIZE` and all of
it. A carnivore below that band still sees and chases herbivores (invariant 4
says nearest wins, unfiltered) but `canEat` refuses every one of them. So a
carnivore that dips under the band is dead, and it takes a thousand ticks to
finish dying — which reads exactly like bad balance.

The fix is not a force or a speed. It is the size bands:
`CARNIVORE_INITIAL_SIZE` (14) and half of `CARNIVORE_MITOSIS_SIZE` (26/2 = 13)
both have to clear `HERBIVORE_MITOSIS_SIZE` (11), with room for what a carnivore
loses between kills. Overshoot it the other way and the carnivores eat every
herbivore by tick 3000 and then starve — that happened too, at
`HERBIVORE_MITOSIS_SIZE = 10` with a cheaper `MOVEMENT_ENERGY_FACTOR`.

Current values: six runs of 40 000 ticks (≈11 minutes at 60 fps), all three
populations alive and oscillating in all six.

**Tune headlessly.** `step(entities, world)` is a plain function on an array, so
a ~20 line script can run 40 000 ticks and print populations and min/mean/max
sizes per species. Watching the canvas cannot tell you the difference between
"carnivores are unlucky" and "carnivores are mathematically unable to eat".

## Deliberately not built

**Phase 2, the keyboard-driven cell.** Out of scope for this plan; the plan's own
"Later" section and `flocking/.agents/plans/keyboard-controlled-boid.md` still
apply, including the `keydown`-only blocker written up there.

**A `.github/workflows/ci.yml` inside this folder.** `flocking/` has one because
it deploys to GitHub Pages; `AGENTS.md` says lulas deploys nowhere yet, and the
standalone repo is also the recovery archive. `amq lulas check` is the check.
Add the workflow when there is something to deploy.
