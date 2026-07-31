# lulas

An ecosystem simulation. Plants grow, herbivores eat plants, carnivores eat
herbivores, and anything big enough eats anything smaller than itself. Cells that
eat enough split in two. Watch it run and see whether it settles or collapses.

> **Status: specification only — there is no code here yet.**
>
> This project existed before, in several versions, and the goal is to recover
> the best one rather than start from scratch. The hunt is
> [`.agents/plans/recover.md`](.agents/plans/recover.md); recovered candidates
> land in `recover/<name>/`. This README is the spec they get measured against.

> **Name.** `lulas` used to be the folder holding a *boids/flocking* simulation.
> That project was renamed to [`flocking/`](../flocking/), which is what it
> actually is, and the `lulas` name came back here — to the cell-eating
> simulation it originally belonged to.

## The world

A rectangle that **wraps on both axes**. Leave through the right edge and you
come back on the left; leave through the top and you come back on the bottom.

This is not decoration — it is a rule the rest of the simulation has to respect.
A cell two pixels from the right edge can see most of its vision radius on the
right side *and* the rest of it wrapped around on the left. Distance between two
things is the shortest distance across the wrap, not the naive one. Get this
wrong and cells near the edges go blind to half the world.

## The inhabitants

### Plants — dark green squares

They do nothing but grow, slowly. They are the only thing that puts energy
**into** the system.

### Herbivores — light green circles

A circle with a stick pointing out of it. The stick *is* the velocity readout:
its direction is where the cell is heading, its length is how fast. No numbers
on screen — you read speed off the length of the line.

They want to eat plants. They also very much do not want to be eaten, and that
comes first: **survival beats lunch**. A herbivore with a plant in front of it
and a carnivore behind it runs.

### Carnivores — red circles

Same drawing as herbivores, red. They hunt the nearest herbivore inside
`CARNIVORE_VISION_RANGE` and catch it by touching it.

If no herbivore is in range but another carnivore is, they will go for the
carnivore instead — subject to the size rule below.

## Eating

Two things decide, and you need **both**: *what* the other cell is, and *how big*
it is.

**Type says whether it is even on the menu.** Herbivores eat plants. Carnivores
eat herbivores, and — when there is no herbivore around — other carnivores.
Herbivores do not eat other herbivores. Carnivores do not eat plants.

**Size breaks the tie.** Among cells, you can only eat one that is **strictly
smaller** than you. Equal sizes cannot eat each other: they meet, touch, and
drift apart.

### Fear follows the same rule

A cell flees what **can eat it** — which means it has to check the type too, not
just the size. That one rule gives you all four cases:

- a herbivore does **not** flee a bigger herbivore — that one cannot eat it, so
  they pass each other by;
- a herbivore **does** flee a bigger carnivore;
- a carnivore does **not** flee a bigger herbivore — it just goes around it;
- a carnivore **does** flee a bigger carnivore.

So a big fat herbivore is terrifying to nobody, and a small carnivore in a field
of large herbivores is in no danger at all — it simply cannot eat them yet.

**Eating is a transfer of area, and it takes time.** A plant of 10 px² makes the
cell that eats it 10 px² bigger — but not in one frame. It drains over a few
ticks, more for a bigger plant (call it ~5 ticks for a large one), so you can
watch a cell sitting on a plant, consuming it.

## Moving costs energy

Cells burn area just by going somewhere. It is slow — a cell loses a little on
every tick it moves — but it never stops, and **the faster it goes the more it
costs**.

This is what makes the whole thing an ecosystem rather than a screensaver:

- take the plants away and the herbivores shrink, tick by tick, until they are
  gone;
- a carnivore that keeps missing its prey starves the same way;
- and chasing is expensive, so a hunt that goes on too long costs more than the
  meal at the end of it.

## Mitosis

Every cell — herbivore or carnivore — splits when it reaches a maximum size. The
two children shoot off in **opposite directions** (any axis; what matters is that
they are opposed).

**Each child gets half the parent's *radius*.** A parent of radius 20 produces
two children of radius 10.

That is deliberately lossy, and it is the point. Halving the radius quarters the
area, so two children hold **half** the area the parent had. The rest is gone —
spent on splitting.

So the whole system is a budget. **Plants are the only thing paying energy in.
Two things burn it: splitting, and simply moving around.** Whether the population
booms, starves or oscillates falls out of the balance between them.

## Tuning knobs

**One file, constants and nothing else.** No logic, no helpers, no computed
defaults reaching into other modules — a flat list of named numbers you can open
and read in ten seconds. This simulation is tuned by feel, and the tuning session
is a lot of small edits to these values; anything else in that file gets in the
way. (`flocking/` does the same in `src/CONFIGURATION.ts` — copy the shape.)

| constant | what it controls |
| --- | --- |
| `HERBIVORE_VISION_RANGE` | how far a herbivore sees plants and threats |
| `CARNIVORE_VISION_RANGE` | how far a carnivore sees prey |
| plant growth rate | how fast energy enters the system |
| mitosis threshold | the size at which a cell splits |
| movement energy factor | how much area speed costs per tick |
| eat duration | ticks to drain a plant / a cell |

The first five are the ones that decide whether the ecosystem lives or dies, so
they are the ones you will actually be turning.

Recovered code may spell it `HERVIVORE_*` (the Spanish spelling leaking in);
normalise to `HERBIVORE_*` when bringing it in.

## Phase 2 — take the wheel

Let the arrow keys drive one cell. It behaves normally on its own, but while the
user is steering, the user wins. Being bigger or smaller than what you steer into
still decides who eats whom.

(The flocking project has its own version of this idea, for boids rather than
predators — [`flocking/.agents/plans/keyboard-controlled-boid.md`](../flocking/.agents/plans/keyboard-controlled-boid.md).)

## See also

- [`AGENTS.md`](AGENTS.md) — the rules restated as implementable invariants.
- [`.agents/plans/recover.md`](.agents/plans/recover.md) — finding the old code.
