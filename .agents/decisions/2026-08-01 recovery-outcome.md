# 2026-08-01 — Recovery outcome: what survived, and what to build on

Three versions recovered from `amatiasq/lulas`: `js-2014` (`1261b88`), `ts-2018`
(`8a067be`), `ts-2020` (`2bcd8c1`). **Nothing was lost** — the force push the
author remembered did not take the predator/prey code with it; every version is
reachable from a branch that still exists. Evidence and the rule-by-rule
scorecard: [`../../recover/README.md`](../../recover/README.md).

The search that found them mattered: hunting for paths matching
`life|carnivor|herbivor|plant` stops working the moment the 2017 refactor renames
them to `CellDiet.ts`/`CellSenses.ts`, so it finds the commit that *deleted* the
species and mistakes it for the one that *had* them.

## The finding that decided everything

**The two TypeScript versions have no ecosystem in them.** They are much better
code — `Cell` decomposed, a double buffer, a spec suite, a perf harness — but
there is no `Plant`, `Herbivore` or `Carnivore`, `setDietType()` is never called,
so `canEat()` is always false and nothing can ever eat anything. The refactor
generalised the species into a diet map and never repopulated it. `js-2014` is
the only version that is the simulation the spec describes, and it is the worst
code of the three (AMD, `Object.create` descriptors, Grunt, bower).

So the choice was never "which version do I continue from": the ecosystem and the
engine survived in different files and neither one alone is the project.

## Decision: build fresh at the folder root

Port the **rules** from `js-2014` (toroidal `getShorterDistance`, `reproduce`'s
two half-radius children, capped plant growth, the palette, and
`isPredator = target.isFood(this)` — flee-what-can-eat-you, arrived at in 2014).
Port the **shape** from `ts-2020` (`energy = π·size²` with an inverting setter,
the diet map as one expression, the multi-tick bite capped at a fraction of the
eater, the double buffer).

Adopting either tree would mean carrying a 2020 webpack or a 2014 Grunt toolchain
to get code whose other half you have to write anyway. Toolchain copied from
`flocking/` instead: same codebase's descendant, already current.

**Nobody had these, so they were written from scratch:** movement costing area
(without it nothing starves and extinction cannot happen), herbivore
flee-priority (all three hunt first), and a constants file.

## Bugs recorded, not fixed — the trees are evidence

- `js-2014` carnivores **cannot** eat carnivores: `Carnivore._isFood` ends in
  `return false;` with unreachable code after it, disabled under a commit named
  "Trying to fix carnivores overpopulation".
- `js-2014` `eat()` adds **diameter**, so eating something your own size
  quadruples your area instead of doubling it — almost certainly the
  overpopulation being fought above, and the argument for the `ts-2020` model.
- `ts-2020` `escapeFrom()` builds its direction exactly like `hunt()` with no
  negation anywhere: it appears to flee *toward* the threat.
- `ts-2020` mitosis conserves energy and can produce more than two children, with
  no opposite directions. Contradicts the spec twice.
