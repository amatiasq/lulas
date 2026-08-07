# 2026-08-01 — The order the simulation was built in, and why

Was the build plan; executed the same day. Kept for the reasoning, which the code
still follows. Outcome: [`2026-08-01 build-outcome.md`](2026-08-01%20build-outcome.md).

**Every step ends green.** Do not build the whole thing and then test it: the
failure modes here are silent, and a population that dies in 40 ticks looks a lot
like a population that was never alive.

1. **The constants file first**, even mostly empty, so nothing gets a chance to
   compute a tunable from somewhere else.
2. **Toroidal distance next**, tested before anything uses it — it is the single
   most likely thing to be quietly missing later, and by then everything in the
   simulation depends on it.
3. **`energy = π·size²`** before any behaviour, so "eating transfers area",
   "movement burns area" and "mitosis loses half the area" are all arithmetic on
   one field instead of three separate rules to keep in step.
4. **`canEat`/`flees` as one function**, with all four fear cases tested: a
   size-only implementation passes two of them and fails two silently.
5. **Flee-priority**, then hunting. Written from scratch — all three recovered
   versions hunt first, which is backwards from "survival beats lunch".
6. **Eating over time**, 7. **movement cost**, 8. **mitosis**, 9. **render**,
   10. **the service worker**, 11. **tuning**.

The integration test that proves the ecosystem exists is step 7's: plant growth
at zero ⇒ the herbivore population reaches zero. **If that test cannot fail,
movement is free and nothing can ever starve.**

`isFamily` was flagged here to be decided deliberately rather than arrive by
copy-paste, because it is in all three recovered versions and in none of the
spec. The call is in the outcome.
