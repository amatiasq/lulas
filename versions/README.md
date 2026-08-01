# versions/ — the frozen versions, and what they need to run

[`recover/`](../recover/) is verbatim: the trees are exactly what the commits
contained, and nothing may be added to them. But `recover/js-2014` cannot be
served as-is — it is missing two files. They live here instead, and
`amq/amq-lulas-build-versions` copies them over the tree **on its way into
`dist/`**, so the archive stays untouched and the exhibit still runs.

Everything here is committed on purpose: a build must not need the network.

`2026/` is a different kind of thing — not a patch but a whole frozen copy of
this project's own sources, so the current simulation can be compared with what
it will have become later. See the bottom of this file.

## `2014/require.js`

RequireJS **2.1.11** — the exact version `recover/js-2014/bower.json` pins, and
its only runtime dependency (`chai` there is for the test runner). The 2014
`index.html` loads it from `bower_components/requirejs/require.js`, a path that
was never committed because `bower_components/` was installed, not tracked.

Taken from cdnjs; the banner at the top of the file states the version.

## `2014/ticker.js`

**The archived commit does not boot without this.** `main.js` at `1261b88` does
`require('ticker')` and `src/ticker.js` is not in that commit — RequireJS 404s
and `main` never runs at all.

That is not a recovery mistake. In the upstream history the file was committed
separately, the same day, in `2f5e35a` — named, in full, *"Missed file"*. It was
sitting uncommitted on the author's machine when `1261b88` was made.

This copy is `git show 2f5e35a:src/ticker.js`, byte for byte: a `Ticker` built on
`requestAnimationFrame`, with `start` / `stop` / `toggle` and an iteration
counter, which is what `main.js` expects.

Re-fetch it with (from a clone of `amatiasq/lulas`):

```sh
git show 2f5e35a:src/ticker.js
```

## `2014/on-black.html`

Not a missing file — an **addition to the deployed page**, appended before
`</body>` in the copy. `amq-lulas-build-versions` injects it; `recover/` never
sees it.

The 2014 page paints its canvas white, in its own `<style>` (the renderer only
calls `clearRect`, so the colour is pure CSS). The current simulation runs on
black. This makes **any query string or hash** — `/2014/?a`, `/2014/#a`, anything
with a character after the `?` or `#` — switch the old one to black too, so the
two can be compared without one of them being inverted. A bare `?` or `#` does
nothing, and `hashchange` is wired up so adding or removing `#a` flips it without
a reload.

## `2026/` — a snapshot of this project, 2026-08-02

A verbatim copy of `lulas/src` and `index.html` as they were on the day it was
taken, served at `/2026`. `amq-lulas-build-versions` bundles it with esbuild
(types stripped, no Vite) and rewrites its `index.html` to point at the bundle.

**It is frozen. Do not fix bugs in it, do not update it when `src/` changes** —
that is the entire point, and a snapshot that gets maintained is not one. When
the current simulation has moved on enough to be worth comparing, take another
one next to it (`2027/`, or whatever it is by then) and add an entry to the
`VERSIONS` list in the build script.

One thing is not verbatim in the output: `import.meta.env.PROD` is pinned to
`false` at bundle time, so the snapshot never tries to register the service
worker. Its page lives under `/2026/` and could not claim the root scope anyway,
and the root worker already precaches these files.
