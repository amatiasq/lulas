# lulas

An ecosystem simulation. Plants grow, herbivores eat plants, carnivores eat
herbivores, and anything big enough eats anything smaller than itself. Cells that
eat enough split in two. Watch it run and see whether it settles or collapses.

Live at **https://lulas.amatiasq.com**. The 2014 original — the only old version
that actually eats — runs alongside it at
**[/2014](https://lulas.amatiasq.com/2014/)**; add any `?query` or `#hash` to
paint it on black. `recover/` holds the three older versions this was rebuilt
from: read it, don't build in it.

**Controls:** `space` pauses · `←` `→` step one frame back and forward, through
ten seconds of recorded history · `+` `−` run it from eight times slow to eight
times fast · `d` draws the debug overlay — the quadtree's grid over the world,
plus frame rate, ms per tick, how many of each kind are alive and the total
energy. The tab title says where in time you are.

## The world

A rectangle that **wraps on both axes**: leave through the right edge and you
come back on the left, leave through the top and you come back on the bottom.
This is not decoration — it is a rule the rest of the simulation has to respect.
A cell two pixels from the right edge sees most of its vision radius on the right
*and* the rest of it wrapped around on the left, and distance between two things
is the shortest distance across the wrap. Get it wrong and cells near the edges
go blind to half the world.

It is sized to your screen, and so is everything in it: the populations are
densities, not counts, so a phone and an 8K monitor get the same crowding rather
than the same fifty cells adrift in very different amounts of space. Below a
certain size the world stops shrinking and is drawn scaled down instead — the
camera pulls back — because a world much smaller than that holds populations too
small to survive their own bad luck, and it simply dies.

## The inhabitants

Everything is a circle, drawn the same way: a dimmed body with the full-strength
colour as a rim around it. A flat disc reads as a blob; a dark disc with a lit
edge reads as a cell.

**Plants — dark green.** They do nothing but grow, slowly, up to a maximum size,
and they are the only thing that puts energy **into** the system. A new seedling
appears somewhere at random every so often, because grazing can take a patch to
zero and a plant population of zero can never recover on growth alone; seeding
stops at a cap, so a world whose herbivores died out does not fill up with green
forever. They are drawn under everything else: a herbivore sitting on a plant
covers it, never the other way round.

**Herbivores — light green.** A circle with a stick pointing out of it. The stick
*is* the velocity readout: its direction is where the cell is heading, its length
is how fast. No numbers on screen — you read speed off the length of the line.
They want to eat plants, and they very much do not want to be eaten, and that
comes first: **survival beats lunch**.

**Carnivores — red.** Same drawing. They hunt the nearest herbivore in range and
catch it by touching it. If no herbivore is in range but another carnivore is,
they go for the carnivore instead — subject to the size rule.

## Eating

Two things decide, and you need **both**.

**Type says whether it is even on the menu.** Herbivores eat plants. Carnivores
eat herbivores, and — when there is no herbivore around — other carnivores.
Herbivores do not eat other herbivores. Carnivores do not eat plants.

**Size breaks the tie.** Among cells, you can only eat one **strictly smaller**
than you. Equal sizes cannot eat each other: they meet, touch, and drift apart.

**Fear follows the same rule**: a cell flees what **can eat it**, which means
checking the type too, not just the size. That one rule gives all four cases — a
herbivore does not flee a bigger herbivore, but does flee a bigger carnivore; a
carnivore does not flee a bigger herbivore, but does flee a bigger carnivore. So
a big fat herbivore is terrifying to nobody, and a small carnivore in a field of
large herbivores is in no danger at all: it simply cannot eat them yet.

**Eating is a transfer of area, and it takes time.** A plant of 10 px² makes the
cell that eats it 10 px² bigger — but not in one frame. It drains over a few
ticks, more for a bigger plant (call it ~5 for a large one), so you can watch a
cell sitting on a plant, consuming it.

## Cells are solid

Two cells cannot stand in the same place: they bump, push each other apart and
lose speed doing it. With two exceptions, both of which exist so that eating
still works — **a predator and the prey it can eat go through each other**
(eating happens by touching, so a solid predator would shove its meal away the
moment it caught it), and **plants are not solid**, so a herbivore can sit on one
to eat it. Everything else bumps, including two herbivores and a carnivore
against a herbivore too big for it.

## Herds and packs

When a cell has nothing chasing it and nothing to eat, it does not just coast: it
falls in with its own kind, the way the boids in [`flocking/`](../flocking/) do —
match their heading, drift toward them, keep out of the ones that get too close.

Two limits keep it from turning into a different game. **Only its own kind**: a
herbivore that took its heading from a carnivore would be steering into its own
predator. **Only when idle**: fleeing beats it, eating beats it, and it is never
mixed in with either.

**Herbivores herd. Carnivores only keep their distance** — no packs. A pack hunts
the same herd and splits the same meal, and it turns out that starves them.

## Moving costs energy

Cells burn area just by going somewhere. It is slow, but it never stops, and
**the faster it goes the more it costs**: the cost is **quadratic** in speed,
which is the choice that punishes sprinting and rewards a predator that waits.

This is what makes the whole thing an ecosystem rather than a screensaver. Take
the plants away and the herbivores shrink, tick by tick, until they are gone; a
carnivore that keeps missing its prey starves the same way; and chasing is
expensive, so a hunt that goes on too long costs more than the meal at the end.

## Mitosis

Every cell splits when it reaches a maximum size. The two children shoot off in
**opposite directions** and **each gets half the parent's *radius***: a parent of
radius 20 produces two children of radius 10.

That is deliberately lossy, and it is the point. Halving the radius quarters the
area, so the two children hold **half** the area the parent had. The rest is
gone, spent on splitting.

**Relatives are not special.** Two cells that just split from the same parent can
eat each other like anybody else — except that they are exactly the same size, so
the size rule already means they cannot, and by the time one has outgrown the
other they are strangers. (Every recovered version had an `isFamily` check; this
one deliberately does not, because the equal-size rule does its job.)

So the whole system is a budget. **Plants are the only thing paying energy in.
Two things burn it: splitting, and simply moving around.** Whether the population
booms, starves or oscillates falls out of the balance between them.

## Tuning

Every number lives in [`src/CONFIGURATION.ts`](src/CONFIGURATION.ts) — **one
file, constants and nothing else**. This simulation is tuned by feel, and a
tuning session is a lot of small edits to those values; anything else in that
file gets in the way. (`flocking/` does the same — copy the shape.)

The pairing that decides whether the ecosystem lives or dies: a herbivore lives
between half `HERBIVORE_MITOSIS_SIZE` and all of it, and a carnivore that drops
under that band has nothing left it is allowed to eat, so it is a dead carnivore
walking. [`AGENTS.md`](AGENTS.md) has the measurements.

## Not built yet

**Take the wheel:** let the arrow keys drive one cell. It behaves normally on its
own, but while the user is steering, the user wins; being bigger or smaller than
what you steer into still decides who eats whom. The flocking project has the
same idea for boids, with the input-layer landmines written up:
[`flocking/.agents/plans/keyboard-controlled-boid.md`](../flocking/.agents/plans/keyboard-controlled-boid.md).

## See also

[`AGENTS.md`](AGENTS.md) — the glossary and the same rules as invariants, with
the traps. [`.agents/decisions/`](.agents/decisions) — how it got here.
