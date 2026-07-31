# 2026-08-01 — Recovery outcome: what survived, and what to build on

Executes [`../plans/recover.md`](../plans/recover.md). Full evidence and the
rule-by-rule scorecard: [`../../recover/README.md`](../../recover/README.md).

## What was found

Three distinct versions, all recovered, all from `amatiasq/lulas`:
`js-2014` (`1261b88`), `ts-2018` (`8a067be`), `ts-2020` (`2bcd8c1`).

**Nothing was lost.** The force push the author remembered did not take the
predator/prey code with it — every version is reachable from a branch that still
exists (`relations-optimization`, `before-tdd`, `before-functional-refactor`).
The VPS checkout that looked like it might be a unique copy is sitting on
`2bcd8c1`, which is the tip of two GitHub branches. No preservation push was
needed. A mirror clone was taken anyway before anything else was done.

The plan's own leads were half wrong and worth correcting for the record: I had
flagged `7ceacd4` as the best candidate and the VPS tree as possibly unique.
Both were based on a `git log --name-only` search for paths matching
`life|carnivor|herbivor|plant`, which stopped matching the moment the 2017
refactor renamed those files to `CellDiet.ts`, `CellSenses.ts` and so on. The
search found the commit that *deleted* them and mistook it for the commit that
*had* them.

## The finding that decides everything

**The two TypeScript versions have no ecosystem in them.**

They are much better code — `Cell` decomposed into `CellBody`/`CellDiet`/
`CellSenses`/`CellPhysic`/`CellRelations`/`CellBehavior`, a `CellState` double
buffer, a `Game` split, a spec suite, a perf harness. But there is no `Plant`,
no `Herbivore`, no `Carnivore`, and `setDietType()` is never called anywhere
outside its own definition. `CellDiet.consider()` always returns `0`, so
`canEat()` is always false, so **nothing can ever eat anything**. The refactor
generalised the species into a diet map and then never repopulated it.

`js-2014` is the only version that is actually the simulation described in the
spec — and it is the worst code of the three by a wide margin (AMD modules,
`Object.create` + descriptor prototypes, Grunt, bower).

So the choice is not "which version do I continue from". It is: **the ecosystem
and the engine survived in different files, and neither one alone is the
project.**

## Decision

**Build fresh at the project root. Port the rules from `js-2014`, port the
architecture from `ts-2020`.** Do not adopt either tree as the base.

Adopting `ts-2020` and re-adding species would mean inheriting a 2020 webpack
toolchain to get code whose ecosystem you have to write anyway. Adopting
`js-2014` would mean carrying AMD and Grunt to keep rules that fit on two pages.
Both are worse than writing it once, in the toolchain the sibling project already
uses.

**Toolchain: copy `flocking/`** — Bun + Vite + Vitest, TDD-first with specs in
`user-stories/`. It is the same codebase's descendant, it is current, and
`amq flocking check` is a working model for `amq lulas check`.

### Take from `js-2014` — the rules

- `Animal.isPredator(t) { return t.isFood && t.isFood(this) }` — flee-what-can-eat-you,
  type-aware. This is the invariant the spec now states, arrived at in 2014.
- `map.getShorterDistance()` — the toroidal distance, wired into every vision
  check. The hardest rule in the spec, already solved.
- `Cell.reproduce()` — two children at `radius = parent.radius / 2`, shoved at
  `direction` and `direction + 180`. Exactly the specified mitosis.
- `Plant.tick()` — growth with a cap.
- The colour scheme: dark green plants, light green herbivores, red carnivores.

### Take from `ts-2020` — the shape

- **`energy` as a derived view of area** (`energy = π·size²`, setter inverts).
  This is the right model; it makes "eating transfers area" fall out for free and
  it is what `js-2014` got wrong.
- `CellDiet`'s type→weight map, and `canEat = dietFactor × sizeDifference > 0` —
  the two-predicate rule as one expression.
- `CellBehavior.interactWithCell`'s six-line decision.
- Bite capped at a percentage of the eater's energy — the multi-tick meal.
- The `CellState` double-buffer idea.
- The spec suite's shape: `diet`, `hunt`, `senses`, `family`.

### Write from scratch — nobody had these

- **Movement costs area, scaled by speed.** Absent from all three. Without it
  nothing starves and extinction cannot happen, which is now a core spec rule.
  First integration test: plant growth at zero ⇒ herbivore population reaches zero.
- **Herbivore flee-priority.** All three hunt first. `js-2014.interact()` picks
  the prey force whenever a prey exists and only escapes when there is none —
  backwards from "survival beats lunch".
- **The constants file.** Nobody had one.

### Deliberately decide, do not inherit

`isFamily` — relatives never eat each other — is in all three versions and is
**not** in the spec. It is a good idea. Either put it in the spec or drop it, but
do not let it arrive by copy-paste.

## Bugs recorded, not fixed

The recovered trees are evidence and were left untouched. Found while reading:

- `js-2014` carnivores **cannot** eat carnivores: `Carnivore._isFood` ends in
  `return false;` with an unreachable `return tmp(target instanceof Cell);`
  after it. Disabled on purpose, under a commit named "Trying to fix carnivores
  overpopulation".
- `js-2014` `eat()` adds **diameter**: `this.diameter += min(this.diameter,
  prey.diameter)`. Eating something your own size quadruples your area instead of
  doubling it — almost certainly the overpopulation being fought above, and a
  concrete argument for the `ts-2020` energy model.
- `ts-2020` `escapeFrom()` builds its direction as `target.pos.sub(this.cell.pos)`
  and shoves along it, exactly like `hunt()`, with no negation in the path — it
  appears to flee *toward* the threat. Verify before porting.
- `ts-2020` mitosis conserves energy and can produce more than two children
  (`childCount = floor(size / (minSize/2))`), with no opposite directions.
  Contradicts the spec twice.

## Next

`recover/` is closed — it is an archive now. The open work is building the
project at the folder root per this decision. `lulas/AGENTS.md` holds the
invariants; `lulas/README.md` holds the spec.
