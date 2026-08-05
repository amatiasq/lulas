# Plan: build the simulation

**Status: DONE** (2026-08-01). All 11 steps executed; outcome, deviations and
the calls made along the way are in
[`./2026-08-01 build-outcome.md`](./2026-08-01%20build-outcome.md).
Kept for the reasoning behind the order, which the code still follows.
**Effort:** L · **Risk:** low technically; the risk is tuning it into something
that dies or explodes on every run — and that is exactly where the time went.

## Read before starting

1. [`../../README.md`](../../README.md) — the spec. What the thing *is*.
2. [`../../AGENTS.md`](../../AGENTS.md) — the same rules as invariants, with the
   traps. Invariant 2 (type **and** size) and invariant 7 (movement costs area)
   are the two that decide whether this works.
3. [`./2026-08-01 recovery-outcome.md`](./2026-08-01%20recovery-outcome.md)
   — what survived and what to take from where.
4. [`../../recover/README.md`](../../recover/README.md) — the scorecard and the
   bugs found in the old code.

**`recover/` is a closed archive.** Read it, port from it, never build in it and
never reformat it.

## Approach

Build fresh at the folder root. Neither recovered version is a base: `js-2014`
has the ecosystem and terrible code, `ts-2020` has good code and **no ecosystem
at all** (no species, `setDietType()` never called, so `canEat()` is always
false). Take the rules from one and the shape from the other.

**Toolchain: copy [`../../../flocking/`](../../../flocking/).** Bun + Vite +
Vitest, TDD-first, specs in `user-stories/`, an `amq/` folder with
`dev|test|build|check`. Same codebase's descendant, already current, and
`amq flocking check` is the model for `amq lulas check`.

## Order

Each step should end green. Do not build the whole thing and then test it — the
failure modes here are silent (a population that dies in 40 ticks looks a lot
like a population that was never alive).

### 1. Scaffold + the constants file

`package.json`, `vite.config.ts`, `tsconfig.json`, `test/` harness, `amq/`
scripts — mirror `flocking/`. Add `src/CONFIGURATION.ts` **first**, even mostly
empty: constants and nothing else, no logic, no imports from other modules.

### 2. World + toroidal distance

The map wraps on both axes. Write `shortestDistance(a, b)` and the wrapped
direction vector, and **test them before anything uses them**:

- two points either side of the right edge are close, not far apart;
- the direction from one to the other points *across* the edge, not back through
  the middle;
- same on the vertical axis, and both at once (corner to opposite corner).

Port from `recover/js-2014/src/map/map.js` → `getShorterDistance`. This is the
single most likely thing to be quietly missing later; nail it now.

### 3. Cell body: area is energy

Take `recover/ts-2020/src/cell/CellBody.ts`:

```ts
get energy() { return pow(this.size, 2) * Math.PI }
set energy(v) { this.size = sqrt(v / Math.PI) }
```

Everything downstream ("eating transfers area", "movement burns area", "mitosis
loses half the area") becomes arithmetic on one field. Do **not** copy
`js-2014`'s `eat()`, which adds diameters — eating something your own size
quadruples your area there, and that is almost certainly why its carnivores
overpopulated.

### 4. Species + the two-predicate rule

Three types: `Plant`, `Herbivore`, `Carnivore`. Plants grow to a cap
(`recover/js-2014/src/life/plant.js`).

Then the rule that everything hangs on, as **one function used by both the threat
scan and the eat resolution**:

```
canEat(a, b) = diet(a) includes type(b)  AND  a.size > b.size
flees(a, b)  = canEat(b, a)
```

`recover/ts-2020` has this as `dietFactor × considerFight > 0` and the six-line
`CellBehavior.interactWithCell`. Port both.

**Test all four fear cases** — a size-only implementation passes two and fails
two silently:

| | bigger herbivore | bigger carnivore |
| --- | --- | --- |
| herbivore | does **not** flee | flees |
| carnivore | does **not** flee | flees |

Plus: equal sizes never eat, in either direction.

### 5. Behaviour: flee first

Herbivore with a plant and a threat both in vision goes for survival. A
**priority, not a blend** — summing the two forces leaves it starving between
them or drifting into the predator.

No recovered version does this: all three hunt first
(`js-2014`'s `interact()` takes the prey force whenever a prey exists). Write it.

Carnivore target order: nearest herbivore in `CARNIVORE_VISION_RANGE`; only if
there is none, a *smaller* carnivore.

Check `recover/ts-2020`'s `escapeFrom()` before porting — it builds its direction
the same way `hunt()` does, with no negation, so it appears to flee *toward* the
threat.

### 6. Eating over time

Bite capped per tick (`ts-2020`: a percentage of the eater's own energy), prey
shrinks as eater grows in the same step, clamp at zero and remove. Handle the
eater splitting or dying mid-meal.

### 7. Movement costs area

Nobody had this. Every tick a cell moves it loses area, scaled by speed
(`movement energy factor`). Linear or quadratic changes the strategy space a lot
— quadratic punishes sprinting; pick one and write down which.

**The integration test that proves the ecosystem exists:** plant growth at zero
⇒ herbivore population reaches zero. If that test cannot fail, movement is free
and nothing can ever starve.

### 8. Mitosis

At the threshold: exactly **two** children, each at **half the parent's radius**
(so half the total area is lost — that is the energy sink, do not "fix" it),
leaving in opposite directions, far enough apart not to instantly re-collide.

Port `recover/js-2014/src/life/cell.js` → `reproduce()`, which does exactly this.
Do **not** port `ts-2020`'s, which conserves energy and can make more than two.

### 9. Render

Plants dark green squares. Herbivores light green circles, carnivores red, each
with a stick: direction = heading, length = speed. No numbers on screen.
Near-edge entities draw on both sides so the wrap looks seamless
(`flocking/src/cell.ts` `renderCell` already does this).

### 10. Offline — `sw.js`

Required by the root `AGENTS.md`: a web project with no server state works
offline. This one is pure code and canvas, so it qualifies with nothing to think
about.

Copy `sanremo/amq/amq-sanremo-build-sw` — it walks `dist/`, precaches everything, and
names the cache from a hash of the file list so a deploy evicts the old one — and
register it behind `import.meta.env.PROD` like `sanremo/src/main.ts` does. Do not
reach for VitePWA/Workbox; those are for the projects that sync data.

### 11. Tune

Now the real work: find values where the thing neither dies in 30 seconds nor
fills the screen. Everything you turn lives in `src/CONFIGURATION.ts`.

## Decide deliberately

`isFamily` — relatives never eat each other — is in **all three** recovered
versions and is **not** in the spec. Good idea, arrived at independently, but it
changes the dynamics (a mitosis pair cannot immediately eat each other). Either
put it in `README.md` as a rule or leave it out. Do not let it arrive by
copy-paste.

## Later

Phase 2, once it runs: drive one cell with the arrow keys, normal behaviour
otherwise, size still deciding who eats whom. The sibling project has the same
idea for boids and the input-layer landmines written up —
[`../../../flocking/.agents/plans/keyboard-controlled-boid.md`](../../../flocking/.agents/plans/keyboard-controlled-boid.md).
Read its "Blocker" section before writing the input layer here; the same
`keydown`-only problem will apply.
