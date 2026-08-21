# 2026-08-01 — Recovery and build: what survived, what was decided

Three versions recovered from `amatiasq/lulas`: `js-2014` (`1261b88`),
`ts-2018` (`8a067be`), `ts-2020` (`2bcd8c1`). **Nothing was lost** — the force
push the author remembered did not take the predator/prey code with it.
Evidence and the rule-by-rule scorecard:
[`../../recover/README.md`](../../recover/README.md).

**The two TypeScript versions have no ecosystem in them.** Much better code —
`Cell` decomposed, a double buffer, a spec suite — but no `Plant`, `Herbivore`
or `Carnivore`: `setDietType()` is never called, so `canEat()` is always
false. `js-2014` is the only version that is the simulation the spec
describes, and it is the worst code of the three. The ecosystem and the engine
survived in different files; neither one alone is the project.

## Build fresh at the folder root

Rules ported from `js-2014` (toroidal distance, two half-radius children,
capped plant growth, `isPredator = target.isFood(this)`); shape from `ts-2020`
(`energy = π·size²`, the diet map, the multi-tick bite, the double buffer).
Adopting either tree meant carrying a 2020 webpack or a 2014 Grunt toolchain
to get code whose other half you write anyway; the toolchain came from
`flocking/`. Written from scratch because no version had them: movement
costing area, herbivore flee-priority, the constants file.

Every build step ends green — failure modes here are silent. The integration
test that proves the ecosystem exists: plant growth at zero ⇒ the herbivore
population reaches zero. **If that test cannot fail, movement is free and
nothing can ever starve.**

## The calls made deliberately

- **`isFamily` is out.** In all three old versions and in no spec; its reason
  (a mitosis pair eating each other) is covered by the size rule — `canEat`
  needs strictly bigger and split children are equal. Spec'd in
  `user-stories/6`.
- **Movement cost is QUADRATIC** — linear makes sprinting cheap; quadratic is
  what makes waiting a strategy.
- **Flee-priority applies to carnivores too**: the argument (a blend leaves
  you drifting into the predator) is about summing forces, not species.
- **Carnivores do NOT filter prey by size** — a chase they cannot finish
  costs the area it burned, and that turned out to be load-bearing.
- **Two terms added to the energy budget**, both declared in `AGENTS.md`,
  both in `simulation.ts` rather than `step()` so a tick stays deterministic:
  seedlings every N ticks and a plant cap.
- Deliberately not ported: `js-2014`'s `eat()` (adds diameters), `ts-2020`'s
  `escapeFrom()` (flees toward the threat) and its mitosis (conserves energy,
  more than two children).

## The tuning trap, which cost most of the time

The first working build had carnivores extinct by tick 1500 and it looked
like balance. It was not: they were **eating nothing at all** — a carnivore
below the size band still chases herbivores that `canEat` refuses one by one,
and takes a thousand ticks to die, which reads exactly like "too weak". The
fix is the size bands: `CARNIVORE_INITIAL_SIZE` (14) and half of
`CARNIVORE_MITOSIS_SIZE` (14) must clear `HERBIVORE_MITOSIS_SIZE` (11) with
room to spare. Overshoot the other way and they eat every herbivore and then
starve.

**Tune headlessly.** `step(entities, world)` is a plain function on an array:
a ~20 line script runs 40 000 ticks and prints populations. The canvas cannot
tell "unlucky" from "mathematically unable to eat".

## Bugs recorded, not fixed — the trees are evidence

- `js-2014`: carnivores cannot eat carnivores (`return false;` with
  unreachable code after it, under a commit named "Trying to fix carnivores
  overpopulation"), and `eat()` adds **diameter** — eating your own size
  quadruples your area.
- `ts-2020`: `escapeFrom()` builds its direction exactly like `hunt()` with
  no negation — it flees *toward* the threat; mitosis conserves energy and
  can make more than two children. Contradicts the spec twice.

Phase 2 (the keyboard-driven cell) stayed out of scope; the `keydown` blocker
lives in `flocking/.agents/plans/keyboard-controlled-boid.md`.
