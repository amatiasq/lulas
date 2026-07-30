# Plan: replace O(n²) `look()` with a spatial Quadtree

**Status:** Prerequisites done, lulas integration NOT started (deferred — not
executing today). The library is imported and live at `mono/npm/quadtree` as
`@amatiasq/quadtree` (via el decision doc de `npm/`): it builds, its 66 tests pass. The root
AGENTS.md `npm/` exception is in place. **Steps 1–2 are complete.** Remaining is
the lulas-side work — Steps 3–5: make lulas consume the package, rewrite
`look()`, add the `push-to-lulas` mirror rewrite, verify.

## Why
`world.look(cell, radius)` in `src/lulas.ts` filters **every** cell against the
target every call, and it's called once per force-applying behavior per cell per
frame. That's O(n²) per behavior per tick — fine at the spec's ~50–100 cells,
but it caps scaling, and spatial partitioning is the natural structure for a
flocking sim. A Quadtree brings neighbour queries to ~O(log n + k).

## The library exists (imported — `mono/npm/quadtree`)
`@amatiasq/quadtree` now lives at `mono/npm/quadtree`, imported from the old
`amatiasq/npm-libraries`. During import the upstream source turned out to be
incomplete and was reconstructed: `ContactType` (referenced but never defined
upstream) was added as an enum (`ANY_CONTACT` / `FULL_CONTAINMENT`), the
`Quadnode.contains`/`getAt` arity was reconciled with a `containment` param, and
a latent infinite-recursion `entitiesCount` was fixed. It builds to ESM +
`.d.ts`, ships raw `.ts` via a `bun` condition, and its 66 tests pass. Source in
`mono/npm/quadtree/src/`: `Quadtree.ts`, `Quadnode.ts`, `IQuadEntity.ts`,
`ContactType.ts`, `QuadtreeCanvasRenderer.ts`, `index.ts`.

Not published to npm yet — lulas will consume it locally via the workspace
(below); publish is optional/later.

### API (as of the fetched source)
```ts
new Quadtree(width, height, options?: Partial<IQuadtreeOptions>)
// options: offsetX=0, offsetY=0, maxEntities=5, maxDepth=5, containment=ANY_CONTACT

add(entity: IQuadEntity): void
getAt(range: IRectangle, containment?: ContactType): IQuadEntity[]   // rectangle query
includes(entity) / contains(entity): boolean
resize(width, height): void
recalculate(): void

interface IQuadEntity { top: number; left: number; right: number; bottom: number }
```

Key mismatch to bridge: `getAt` queries a **rectangle** and entities are
**AABBs**, but `look()` wants cells within a **circular radius**. So the query is
"box query, then filter by `cellDistance` for the true circle" — same result set
as today, just seeded from the tree instead of the full list.

## Decision (locked)
Quadtree is a **standalone library**, not part of lulas. It lives in
`mono/npm/quadtree` as `@amatiasq/quadtree` (publishing to npm is optional/later
— local consumption below needs no publish), and lulas consumes it **by package
name** via Bun workspaces. No copy/build step, no vendoring into lulas. The root
AGENTS.md `npm/` exception this relies on is **already in place** (Step 2 done).

Two workspace layers (verified on Bun 1.3.3 — they coexist, separate lockfiles,
shared source, no conflict):

- **`mono/npm/` is a workspace root** (`"workspaces": ["*"]`) — where the libs
  are developed/tested/published; interdependent libs resolve each other via
  `workspace:*`. Needed so `cd npm/quadtree && bun test` resolves its siblings.
- **Each consumer declares the libs as members**: `lulas/package.json` gets
  `"workspaces": ["../npm/*"]` and depends on `"@amatiasq/quadtree":
  "workspace:*"`. Bun links the lib **and its transitive `npm/` deps** into
  lulas.

Why not `file:../npm/quadtree`? Verified it **fails** the moment a lib has an
internal `workspace:*` dep — `file:` can't resolve `workspace:*` from outside
the workspace (`@amatiasq/util@workspace:* failed to resolve`). Since the whole
point is a set of *interdependent* libs, `file:` is out; the consumer must join
the workspace.

The mirror still works because lulas imports `@amatiasq/quadtree` by name either
way — only `package.json` differs between the mono checkout and the standalone
repo, and `push-to-lulas` rewrites it (Step 3).

`workspace:^` is Bun/pnpm/yarn only (not npm). On publish, Bun rewrites a lib's
own workspace deps to real ranges in the tarball, so the published
`@amatiasq/quadtree` — which depends on `@amatiasq/geometry`, not on
`@amatiasq/util`; that dependency was declared but never imported and has been
dropped — installs fine externally. Verified by installing the published tarball.

## Step 1 — `mono/npm/` workspace + quadtree imported ✅ DONE
Done via [`mono/.agents/decisions/2026-07-30 npm-shared-libraries.md`](../../../.agents/decisions/2026-07-30%20npm-shared-libraries.md):
`npm/` is a Bun workspace, `@amatiasq/quadtree` lives at `mono/npm/quadtree`
(ESM + `.d.ts`, raw `.ts` via `bun` condition, 66 tests green). See the "library
exists" section above for the reconstruction notes.

## Step 2 — root AGENTS.md `npm/` exception ✅ DONE
The "shared libraries" carve-out to the no-cross-project-imports rule is in the
root `AGENTS.md` (the `npm/` bullet under "Repo shape").

## Step 3 — lulas consumes it + the mirror rewrite
In `lulas/package.json`:
```jsonc
{
  "workspaces": ["../npm/*"],
  "dependencies": { "@amatiasq/quadtree": "workspace:*" }
}
```
`bun install` symlinks it; `import { Quadtree } from '@amatiasq/quadtree'` works
in dev with live edits. Vite bundles it into lulas's app build normally.

The standalone `amatiasq/lulas` repo has no `../npm` and isn't a workspace, so
`push-to-lulas` must transform the mirrored `package.json`:

1. **Drop the `workspaces` field** (no `../npm/*` in the standalone repo).
2. **Rewrite each `"@amatiasq/<x>": "workspace:*"`** → `"^<version>"`, reading
   the version from `npm/<x>/package.json`.

```jsonc
// mono checkout                         // mirrored amatiasq/lulas
"workspaces": ["../npm/*"],              // (removed)
"@amatiasq/quadtree": "workspace:*"      "@amatiasq/quadtree": "^1.0.0"
```

Then downstream `bun install` pulls `@amatiasq/quadtree` from npm and
`bun run build` succeeds. Best done generically in `amq mono push-subtree` (any
`workspace:*` on an `@amatiasq/*` name → published version of the matching
`npm/<x>`, plus strip `workspaces`) so the next `npm/` consumer gets it free.
Must run **before** the mirror commit; verify the lib version is actually
published first, or downstream install 404s.

## Step 4 — integrate into the engine
In `lulas.ts`, per `step()` (positions move every tick, so rebuild each frame):

1. Build the tree at world size: `new Quadtree(size.x, size.y)`.
2. Wrap each cell as an `IQuadEntity` — an AABB around its position. Either
   carry the cell on the entity (`{ cell, top, left, right, bottom }`) or keep a
   `Map<IQuadEntity, Cell>` so the query result maps back to cells.
3. Rewrite `look(cell, radius)`:
   ```ts
   const box = { top: cell.position.y - radius, bottom: cell.position.y + radius,
                 left: cell.position.x - radius, right: cell.position.x + radius };
   return tree.getAt(box)
     .map(toCell)
     .filter((x) => x.id !== cell.id && cellDistance(cell, x) < radius);
   ```
   Same filter as today (id-exclusion + circular distance from #2's fix), so
   behaviour is identical — only the candidate set shrinks.

Build the tree from the **previous-frame** `cells` (the array `look` reads
today), consistent with the double-buffer from `import-fixes.md` #1. Do #1
first, or the tree and the mutation model will disagree about which frame
neighbours belong to.

Edge cases: toroidal wrap (`roundMap`) means a cell near an edge has neighbours
across the seam that a single box query misses. Today's O(n²) `look` also misses
them (it's pure distance, no wrap), so this is **not a regression** — but note it
as a known limitation; fixing it means querying up to 4 wrapped boxes.

## Step 5 — verify
- All lulas specs green (behaviour must be identical for small N).
- Add a spec: `look()` via quadtree returns the same set as a brute-force
  distance filter, for random cell layouts. This is the real safety net.
- Optional: a perf spec / benchmark at N=1000 to confirm the win.
