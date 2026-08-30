# 2026-08-01 — Recovery and build: what survived, what was decided

**Nothing was lost**: the force push the author remembered did not take the
predator/prey code with it. `js-2014` (`1261b88`), `ts-2018` (`8a067be`) and
`ts-2020` (`2bcd8c1`) came back, scored in [`recover/README.md`](../../recover/README.md).

**The two TypeScript versions have no ecosystem in them**: better code, but
`setDietType()` is never called, so `canEat()` is always false. `js-2014` is the
only one that is the simulation the spec describes, so this is a fresh build:
rules from `js-2014`, shape from `ts-2020`, toolchain from `flocking/`.

Bugs left in the trees, because the trees are the evidence: `js-2014` carnivores
cannot eat carnivores (`return false;` with unreachable code after it, in a
commit named "Trying to fix carnivores overpopulation") and its `eat()` adds
**diameter**, so eating your own size quadruples your area; `ts-2020`'s
`escapeFrom()` flees *toward* the threat, and its mitosis conserves energy and
can make more than two children.
