# 2026-08-01 — Build outcome: the simulation runs

Built fresh at the folder root per
[`2026-08-01 recovery-outcome.md`](2026-08-01%20recovery-outcome.md), in the
order argued in [`2026-08-01 build-order.md`](2026-08-01%20build-order.md).
`recover/` was read and never touched.

Deliberately not ported: `js-2014`'s `eat()` (adds diameters), `ts-2020`'s
`escapeFrom()` (flees toward the threat) and `ts-2020`'s mitosis (conserves
energy, can make more than two children). Written from scratch because no version
had them: movement costing area, herbivore flee-priority, the constants file.

## The calls made deliberately

**`isFamily` is out.** Relatives can eat each other. The reason it was in all
three old versions — a mitosis pair immediately eating each other — is already
covered by the equal-size rule: the children of a split are exactly the same
size, and `canEat` needs strictly bigger. Spec'd in `user-stories/6`.

**Movement cost is QUADRATIC.** Linear would have made sprinting cheap;
quadratic is what makes waiting a strategy.

**Flee-priority applies to carnivores too**, though the spec only demands it of
herbivores: the argument (a blend leaves you drifting into the predator) is about
summing forces and does not care about species.

**Carnivores do NOT filter prey by size.** The nearest herbivore wins, even one
too big to eat; a chase it cannot finish costs it the area it burned. That turned
out to be load-bearing — see below.

**Two terms added to the energy budget, both declared** in `AGENTS.md`, both in
`simulation.ts` rather than `step()` so a tick stays deterministic for the specs:
seedlings every N ticks (without them a grazed-flat world is permanently dead,
because growth is multiplicative on existing plants) and a plant cap (found by
running 20 000 ticks: after the herbivores died the plant count grew forever).

## The tuning trap, which cost most of the time

The first working build had carnivores extinct by tick 1500, every run, and it
looked like they were simply too weak. They were not — they were **eating nothing
at all**, and shrinking on movement cost alone.

A herbivore lives between half `HERBIVORE_MITOSIS_SIZE` and all of it. A
carnivore below that band still sees and chases herbivores but `canEat` refuses
every one of them, and it takes a thousand ticks to finish dying, which reads
exactly like bad balance.

The fix is not a force or a speed, it is the size bands:
`CARNIVORE_INITIAL_SIZE` (14) and half of `CARNIVORE_MITOSIS_SIZE` (28/2 = 14)
both have to clear `HERBIVORE_MITOSIS_SIZE` (11), with room for what a carnivore
loses between kills. Overshoot the other way and the carnivores eat every
herbivore by tick 3000 and then starve — that happened too, at
`HERBIVORE_MITOSIS_SIZE = 10` with a cheaper `MOVEMENT_ENERGY_FACTOR`.

**Tune headlessly.** `step(entities, world)` is a plain function on an array, so
a ~20 line script runs 40 000 ticks and prints populations and sizes per species.
Watching the canvas cannot tell you the difference between "carnivores are
unlucky" and "carnivores are mathematically unable to eat".

## Deliberately not built

Phase 2, the keyboard-driven cell: out of scope, and the `keydown`-only blocker
written up in `flocking/.agents/plans/keyboard-controlled-boid.md` still applies.
