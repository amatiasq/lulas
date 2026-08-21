# lulas

An ecosystem simulation. Plants grow, herbivores eat plants, carnivores eat
herbivores, and anything big enough eats anything smaller than itself. Cells
that eat enough split in two. Watch it run and see whether it settles or
collapses.

Live at **https://lulas.amatiasq.com**. The 2014 original — the only old
version that actually eats — runs alongside it at
**[/2014](https://lulas.amatiasq.com/2014/)**; add any `?query` or `#hash` to
paint it on black. `recover/` holds the three older versions this was rebuilt
from: read it, don't build in it.

**Controls:** `space` pauses · `←` `→` step one frame back and forward,
through ten seconds of recorded history · `+` `−` run it from eight times
slow to eight times fast · `d` draws the debug overlay: the quadtree's grid,
frame rate, ms per tick, populations and total energy. The tab title says
where in time you are.

The rules of the world — who eats whom, what everything costs, and why — are
the invariants in [`AGENTS.md`](AGENTS.md). Every number lives in
[`src/CONFIGURATION.ts`](src/CONFIGURATION.ts); tuning is editing it with the
sim running (`amq lulas local`).

History: [`.agents/decisions/`](.agents/decisions).
