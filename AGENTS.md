# lulas — AGENTS.md

Predator/prey ecosystem simulation: plants, herbivores, carnivores, size-based
eating, mitosis, on a toroidal map. Human-facing spec and the narrative version:
[`README.md`](README.md). This file is the same rules stated as things you can
implement and test, plus the traps.

## Current state

**No implementation yet — but the recovery is done.** Three previous versions
were found and are archived in [`recover/`](recover/): `js-2014`, `ts-2018`,
`ts-2020`. Read [`recover/README.md`](recover/README.md) for the rule-by-rule
scorecard and
[`.agents/decisions/2026-08-01 recovery-outcome.md`](.agents/decisions/2026-08-01%20recovery-outcome.md)
for what to do with them.

The short version: **the ecosystem and the engine survived in different
versions.** `js-2014` is the only one that is actually this simulation (plants,
herbivores, carnivores, toroidal vision, correct mitosis) and it is the worst
code. The TypeScript versions are far better structured but have no species at
all — `setDietType()` is never called, so `canEat()` is always false and nothing
ever eats anything.

So: **build fresh at this folder's root**, port the rules from `js-2014` and the
architecture from `ts-2020`, and copy the toolchain from
[`../flocking/`](../flocking/) (Bun + Vite + Vitest, TDD-first with specs in
`user-stories/`) — same codebase's descendant, and already current.

`recover/` is a **closed archive**: verbatim trees kept as evidence. Do not lint,
format or upgrade them, and do not build on top of them in place.

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

### 4. Carnivore fallback order: herbivore, then carnivore

Nearest herbivore in `CARNIVORE_VISION_RANGE` wins. Only when there is none does
a carnivore consider another carnivore — and then invariant 2 still applies, so
it only goes for a *smaller* one.

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

Whether the cost is linear or quadratic in speed changes the strategy space a
lot (quadratic punishes sprinting and rewards patient predators). Pick one, put
it behind the constant, and write down which you chose.

Watch the interaction with **eating**: a cell losing area while draining a plant
is fine, but the two must not fight over the same field in the same tick in a way
that lets area go negative. Clamp at zero and remove the cell.

### 8. Energy budget

**One source: plants. Two sinks: mitosis and movement.** The entire behaviour of
the simulation is the ratio between them, so if you add a third term of either
kind (decay, starvation timers, spontaneous generation, a cost for being eaten)
say so **here** — an undocumented term turns every tuning session into a guess.

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

Required knobs:

| constant | controls |
| --- | --- |
| `HERBIVORE_VISION_RANGE` | how far a herbivore sees plants and threats |
| `CARNIVORE_VISION_RANGE` | how far a carnivore sees prey |
| plant growth rate | the only energy input |
| mitosis threshold | the size at which a cell splits |
| movement energy factor | how much area speed costs per tick |
| eat duration / max bite | ticks to drain a plant or a cell |

## Deployment

None yet. Nothing is mirrored out of this folder — the standalone repo
`amatiasq/lulas` currently receives the *flocking* project's mirror history and
is the source for recovery. Read `.agents/plans/recover.md` before changing any
mirror wiring, so a sync doesn't overwrite what you are trying to recover.
