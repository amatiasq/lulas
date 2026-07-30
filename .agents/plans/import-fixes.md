# Plan: architecture fixes carried over from the import review

Three correctness/clarity issues found reviewing the engine after the
webpack→Vite migration. All three are independent and can land as separate
commits. They share one theme: the `step()` mutation model is half-immutable,
half-mutable, and the fragility flows from there.

Fix order matters: **#1 first** (it changes the frame model the other two
assume), then **#3** (depends on the double-buffer), then **#4** (standalone).

---

## #1 — `step()` shallow-copies cells, so nested vectors are shared

### Problem
`src/lulas.ts` `step()`:

```ts
cells = cells.map((x) => {
  const cell = { ...x };           // shallow!
  behaviors.forEach((b) => b(cell, world));
  return cell;
});
```

`{ ...x }` copies the top-level fields but `position`, `velocity`,
`acceleration` are **the same objects** on `x` (previous frame) and `cell` (next
frame). Behaviors that mutate a vector in place — `applyForce` does
`cell.acceleration.x += …`, `solidBody` writes `position.x/y` — therefore also
scribble on the previous frame's cell, which is still the one `look()` returns
to *other* cells being stepped in the same pass. The result is neither a clean
double-buffer (all cells read a frozen previous state, write a fresh next state)
nor honest full-mutation. It works today only by luck of ordering.

### Fix
Commit to a **double-buffer**. Deep-copy the mutable vectors when snapshotting:

```ts
cells = cells.map((x) => {
  const cell = {
    ...x,
    position: { ...x.position },
    velocity: { ...x.velocity },
    acceleration: { ...x.acceleration },
  };
  behaviors.forEach((b) => b(cell, world));
  return cell;
});
```

Now `look()` (which reads the old `cells` array during the map) always sees the
untouched previous frame, and each behavior writes only to its own `cell`.

Consider a small helper (`cloneCell` in `cell.ts`) so the copy list can't drift
from the `Cell` shape.

### Consequence for #3
This makes `solidBody`'s writes to the *neighbor* (`other`) a cross-frame write
— it mutates a previous-frame cell. That's the bug #3 addresses; do #1 first so
the double-buffer invariant exists to fix against.

### Verification
- All 8 specs still green.
- New spec: `step()` must not mutate its input cells — snapshot a cell's
  `position/velocity/acceleration`, step, assert the originals are unchanged.

---

## #3 — `solidBody` double-counts collisions and mutates neighbors

### Problem
`solidBody` runs once per cell, but each run mutates **both** `cell` and the
neighbor `other` (pushes both apart, swaps their velocities). So a pair (A, B)
is resolved twice — once while stepping A, once while stepping B — and each run
writes into a cell that belongs to the previous frame (`other` comes from
`look()`), which after #1 is an explicit invariant violation. Net effect:
order-dependent, non-deterministic physics.

### Fix
Make the behavior resolve **only the current cell**, reading neighbors as
read-only previous-frame state:

- Compute the separation displacement for `cell` alone (push `cell` away from
  `other` by the full overlap, not half — the other cell pushes itself away
  symmetrically when it is stepped).
- Compute `cell`'s post-collision velocity from the pair's previous-frame
  velocities, write it to `cell` only. The current `collisionBrake_bounce`
  swap becomes "adopt the other's (previous) velocity, scaled by friction".
- Never write to `other`.

Because every cell runs the same rule against the same frozen previous frame,
the pair is resolved once per cell consistently and the outcome is
order-independent.

### Verification
- User-story 5 ("cells should not overlap") stays green.
- New spec: stepping is order-independent — shuffle the cells array, step, and
  assert the resulting positions/velocities match (by id) an unshuffled run.

---

## #4 — `CellId` brand type lies about its runtime value

### Problem
`src/cell.ts`:

```ts
export type CellId = '[number CellId]';   // a string-literal brand
let lastId = 0;
function getNextId() {
  return (lastId++ as any) as CellId;     // ...holding a number
}
```

The type says `CellId` is a specific string; the value is a `number` forced
through `as any`. Any code that trusts the type (e.g. string ops on an id) is
wrong, and the `as any` disables the checking that would catch it.

### Fix
Make the brand honest over the real runtime type (number):

```ts
export type CellId = number & { readonly __brand: 'CellId' };
function getNextId(): CellId {
  return lastId++ as CellId;   // no `as any`
}
```

`logCell` interpolates the id into a string, which works for a number.

Note: `Color` in `color.ts` uses the same `'[string Color]'` brand trick, but
there the value really is a string, so it's only ugly, not wrong. Out of scope
here; fix it the same way (`string & { __brand: 'Color' }`) if touching color.

### Verification
- `tsc --noEmit` clean, all specs green (id is only ever compared/printed).
