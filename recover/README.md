# recover/ — the surviving versions of lulas

Three distinct versions of the predator/prey simulation, recovered 2026-08-01
from the history of `amatiasq/lulas`. This folder is **evidence, not the
project**: the trees are verbatim, unformatted, un-upgraded. Do not lint or
modernise them — read them, take what is right, and build the real thing at the
project root.

## Provenance

Everything came out of one place. The force push the author remembered did not
destroy this — all three are reachable from branches that still exist on GitHub.

| folder | ref | commit | date | toolchain |
| --- | --- | --- | --- | --- |
| `js-2014/` | in the history of `relations-optimization`, `before-tdd`, `before-functional-refactor` | `1261b88` — "Trying to fix carnivores overpopulation" | 2014-05-05 | plain JS, AMD/RequireJS, Grunt, Karma, bower |
| `ts-2018/` | tip of `origin/relations-optimization` | `8a067be` — "fix: Crash when performance.json is missing" | 2018-06-27 | TypeScript, webpack, Jasmine-style specs |
| `ts-2020/` | tip of `origin/before-tdd` **and** `origin/before-functional-refactor` (identical commit) | `2bcd8c1` — "Stable?" | 2020-02-15 | TypeScript, webpack, specs + perf harness |

Re-fetch any of them with:

```sh
git clone --mirror git@github.com:amatiasq/lulas.git
git --git-dir=lulas.git archive <commit> | tar -x -C <dir>
```

The `.git` directories were deliberately **not** copied in — a nested repo inside
mono becomes a gitlink and stops being readable. The commits above are the
provenance; the mirror clone is one command away.

### About the VPS copy

`amatiasq.com:~/vps/repos/lulas` is a detached-HEAD checkout at `2bcd8c1`,
last touched 2024-03-19. It is **byte-identical in provenance to `ts-2020/`** —
same commit — so it is not a fourth version and nothing was uniquely at risk
there. The earlier worry that it might be the only copy was wrong: the commit is
on two GitHub branches.

## Scorecard

Against the spec in [`../README.md`](../README.md). ✅ implemented, ⚠️ partial or
different, ❌ absent.

| spec rule | js-2014 | ts-2018 | ts-2020 |
| --- | :---: | :---: | :---: |
| Plants exist and grow | ✅ | ❌ | ❌ |
| Herbivores / carnivores exist as types | ✅ | ❌ | ❌ |
| Eating gated on **type** | ✅ | ⚠️ | ⚠️ |
| Eating gated on **strictly bigger** | ✅ | ✅ | ✅ |
| Fleeing uses the same predicate (type-aware) | ✅ | ✅ | ✅ |
| Herbivore priority: flee before forage | ❌ | ❌ | ❌ |
| Carnivore falls back to carnivore | ⚠️ | ❌ | ❌ |
| Toroidal distance used for vision | ✅ | ❌ | ❌ |
| Eating transfers **area**, over several ticks | ⚠️ | ✅ | ✅ |
| Mitosis: 2 children, half radius, opposite ways | ✅ | ❌ | ❌ |
| Movement costs energy, scaled by speed | ❌ | ❌ | ❌ |
| Knobs in one constants-only file | ❌ | ❌ | ❌ |

### The headline

**The two TypeScript versions are better engineered and have no ecosystem in
them.** They are the interesting half of the refactor: `Cell` split into
`CellBody` / `CellDiet` / `CellSenses` / `CellPhysic` / `CellRelations` /
`CellBehavior`, a `CellState` double buffer, a `Game` split, a real spec suite
(`diet`, `hunt`, `senses`, `family`, `world`, `state`) and a perf harness.

But there is **no `Plant`, no `Herbivore`, no `Carnivore` class**, and
`setDietType()` — the only way to put anything on a cell's menu — is never called
anywhere outside its own definition. `CellDiet.consider()` therefore always
returns `0`, so `canEat()` is always false, so nothing ever eats anything. The
species were refactored away and never rebuilt. They are an engine, not a
simulation.

**js-2014 is the only one that actually is the simulation described.** It is also
the ugliest code by a distance.

## What each one gets right

### `js-2014` — the ecosystem

- `Plant.tick`: `if (this.area < 100) this.diameter += 0.05` — the energy input,
  with a growth cap.
- `Herbivore._isFood = target instanceof Plant`. Colours match the spec:
  plants `rgb(0,100,·)` dark green, herbivores `rgb(100,255,·)` light green,
  carnivores `rgb(255,0,·)` red.
- `Animal.isPredator(target) { return target.isFood && target.isFood(this) }` —
  **this is exactly the "flee what can eat you" rule**, type-aware, arrived at
  independently in 2014. A herbivore never flees a herbivore because a herbivore's
  `_isFood` only matches plants.
- `Animal.canFight(t) { return !isAnimal(t) || this.diameter > t.diameter }` —
  strictly bigger between animals; plants are always edible.
- `map.getShorterDistance(from, to)` — **the toroidal distance**, used by
  `seeObject` for every vision check. The hardest rule in the spec, already done.
- `Cell.reproduce()`: two children, `new Type(location, this.radius)` so each
  child's *diameter* is the parent's *radius* — the half-radius, quarter-area
  split — shoved at `direction` and `direction + 180`. **Precisely the spec.**

### `ts-2018` / `ts-2020` — the engine

- `energy` is area: `get energy() { return pow(size, 2) * PI }` and the setter
  inverts it. Eating moves energy, so it moves area, and radius follows. This is
  the right model and js-2014 does not have it.
- `CellDiet.eat` takes a bite capped at `MAX_BITE_SIZE` — in `ts-2020` a
  *percentage* of the eater's own energy — which is the "eating takes several
  ticks" mechanic, properly done.
- `CellBehavior.interactWithCell` is the whole decision in six lines:
  `if (canEat(other)) hunt/eat; else if (other.canEat(this)) escapeFrom(other)`.
- `CellState` + `CellState-buffer` (`ts-2020` only): a real double buffer, so a
  tick reads the previous frame and writes the next. The sibling `flocking`
  project still has this as an open bug.
- A spec suite worth keeping the shape of, and a `perf/` harness.

## What is missing from all three

- **Movement never costs energy.** No version has it. `friction` slows cells down
  but nothing shrinks them, so nothing can starve and extinction is impossible.
  This is new in the spec and has to be written from scratch.
- **Herbivore flee-priority.** All three hunt first: js-2014's `interact()` picks
  the prey force when there is a prey, and only escapes when there is not —
  backwards from "survival beats lunch".
- **A constants file.** js-2014 scatters `this.factor['…']` assignments through
  constructors; `ts-2020` hardcodes them inline in `GameEntities.setUpCell`
  (`MITOSIS_MIN_RADIUS` 50, `VISION_RANGE` 300, …). Neither has one file to tune.

## `js-2014` does not boot as archived

Found when it was first actually served, rather than read. `main.js` at
`1261b88` does `require('ticker')` and **`src/ticker.js` is not in that commit**:
RequireJS 404s and `main` never executes.

Nothing was lost in the recovery — upstream, the file was committed separately
the same day in `2f5e35a`, named *"Missed file"*. It was uncommitted on the
author's machine when `1261b88` was made. The commit archived here is the state
of the repository, faithfully, including that.

The tree stays as it is. The deployed copy at `/2014` gets the file (and
RequireJS itself, also never committed) patched in on its way to `dist/` — see
[`../versions/README.md`](../versions/README.md).

## Bugs found while reading

Worth knowing before copying any of it.

- **`js-2014` carnivores cannot eat carnivores.** `Carnivore._isFood` ends with
  `return false;` followed by unreachable `return tmp(target instanceof Cell);`.
  The fallback was written and then disabled — consistent with the commit
  message it sits under, "Trying to fix carnivores overpopulation".
- **`js-2014` eating adds diameter, not area.** `eat()` does
  `this.diameter += min(this.diameter, prey.diameter)`. Since area goes with the
  square, a cell that eats something its own size **quadruples** its area rather
  than doubling it. This alone probably explains the overpopulation the author
  was fighting.
- **`ts-2020` `escapeFrom` appears to flee toward the threat.** It builds
  `direction = target.pos.sub(this.cell.pos)` — pointing at the target — and
  shoves along it, identically to `hunt`. No negation anywhere in the path.
  Verify before reusing; if real, prey have been running into predators.
- **`ts-2020` mitosis conserves energy and can make more than two children.**
  `childCount = floor(size / (minSize / 2))`, `childEnergy = energy / childCount`.
  No loss, no opposite directions. Contradicts the spec twice over.
- Both TS versions carry `isFamily` — relatives never eat each other. Not in the
  spec. It is a nice idea; decide deliberately rather than inheriting it.

## Recommendation

See [`../.agents/decisions/2026-08-01 recovery-outcome.md`](../.agents/decisions/2026-08-01%20recovery-outcome.md).
