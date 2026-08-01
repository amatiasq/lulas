# Plan: lulas.amatiasq.com, with the old versions running next to it

**Status: half done.** `/2014` is built and precached (`amq lulas build-versions`,
wired into `bun run build`); the infra — Dockerfile, compose, `amq lulas deploy`,
DNS — is not.

**Scope narrowed by the author, 2026-08-01: only 2014 ships.** `ts-2018` and
`ts-2020` stay in `recover/` for the shape of the code and are NOT deployed —
neither has any species in it, so there would be nothing to watch. Everything
below about esbuild, bundling flags and Linux case-sensitivity is therefore
**not needed**; it is kept because it is what those trees would cost if that
ever changes.

**Effort:** S for what is left · **Risk:** low.

## What it is

One subdomain, `lulas.amatiasq.com`, serving the current simulation at `/` and
every recovered version underneath it:

| path | what runs |
| --- | --- |
| `/` | the current simulation (`src/`, Vite build) |
| `/2014` | `recover/js-2014` — plain JS + RequireJS, the original |

`/2018` and `/2020` were considered and dropped (above). The manifest in
`amq-lulas-build-versions` still takes a list, so adding one later is an entry
rather than a new build path.

## Read this before promising anyone "the 2018 one, working"

**`/2018` and `/2020` will run and show nothing eating anything.** That is not a
deploy bug, it is what those commits are: `setDietType()` is never called, so
`canEat()` is always false — see
[`2026-08-01 recovery-outcome.md`](../decisions/2026-08-01%20recovery-outcome.md).
They are the engine, not the ecosystem. `/2014` is the only old one that is
actually the simulation, and even it has carnivores unable to eat carnivores
(disabled on purpose under "Trying to fix carnivores overpopulation").

So the exhibit is honest only if each version is **labelled with what works in
it**. That is a feature of the page, not a footnote.

## What was verified, and what it cost

All three were actually built/served during planning, not assumed:

- **`js-2014` needs no build at all.** `bower.json` lists exactly one runtime
  dependency, `requirejs ~2.1.11` (chai is test-only), and `index.html` loads
  `bower_components/requirejs/require.js` then `require.config({baseUrl:'src/'})`.
  Vendor a `require.js` next to the copied tree and it runs off static files.
  Note `urlArgs: Date.now()` — it cache-busts every module on every load, which
  interacts with the service worker (below).
- **`ts-2018` bundles with esbuild out of the box.** `esbuild demo/main.ts
  --bundle` → 38 KB, no errors. No namespaces, no decorators, no `const enum`,
  so type-stripping is enough; its original Parcel 1.x toolchain never has to
  run again.
- **`ts-2020` needs one flag: `--resolve-extensions=.js,.ts`.** Its
  `CellState-buffer.ts` is declaration-only (`export declare function buffer`)
  and the implementation lives in the sibling `CellState-buffer.js`. Parcel
  resolved the `.js`; esbuild prefers `.ts` and fails with "No matching export".
  With the flag: 35 KB, clean.

### The landmine: case-sensitivity

`ts-2020` (and `ts-2018`) import `'../Cell'`, `'../Vector'`, `'../World'` while
the files on disk are `cell/`, `vector.ts`, `world.ts`. esbuild warns and
resolves anyway on macOS. **On Linux it will not resolve at all**, and the deploy
image is built `--platform linux/amd64`.

Two ways out, and the archive rule (`recover/` is verbatim, never edited) rules
out the obvious third one of just renaming the files:

1. **Build the version bundles on the host and `COPY` them into the image.** The
   Dockerfile only serves. Simple; the build is already a `bun run build` step.
2. **Stage a case-fixed copy** into a temp dir at build time and bundle from
   there. More moving parts, but it keeps the build reproducible on Linux/CI.

Prefer (1) until something needs to build in CI.

## Shape

```
dist/
  index.html, assets/     ← current sim
  versions.html           ← the index: what each one is and what works in it
  2014/                   ← file copy of recover/js-2014 + vendored require.js
  2018/  index.html + bundle.js
  2020/  index.html + bundle.js
```

A manifest (`versions.json` or a `.ts` module) drives it:

```
{ path: '2014', source: 'recover/js-2014', kind: 'amd',
  label: 'The original. Plants, herbivores, carnivores — the only old one that
          actually eats.' }
{ path: '2020', source: 'recover/ts-2020', kind: 'esbuild',
  entry: 'demo/main.ts', esbuild: ['--resolve-extensions=.js,.ts'],
  label: 'Better engine, no species: nothing can eat anything.' }
```

`amq lulas build-versions` reads it, copies or bundles each entry into `dist/`,
and generates `versions.html`. Adding a version is one object.

**Nothing writes into `recover/`.** esbuild reads from it and writes to `dist/`;
the 2014 tree is copied out. The archive stays an archive.

A build-time banner can be injected into each *copied* `index.html` ("you are
looking at 2014 — back to latest"), which is not an edit to the archive.

## The service worker — DONE, and the two traps in it

`/2014` is precached like the rest of the site: the author wants it working
offline too. 19 files, ~90 KB. Two things had to change in
`amq-lulas-build-sw`, both of which fail silently rather than loudly:

- **`/index.html` is not the URL a navigation asks for.** The builder folded only
  the root one to `/`; a visit to `/2014/` therefore missed the cache, and offline
  it fell through to the navigation fallback. Now every `.../index.html` is cached
  under BOTH its directory URL and its file URL.
- **The fallback served the wrong program.** An uncached navigation returned the
  `/` shell — so `/2014/` offline would have quietly started the *current*
  simulation. It now looks for the nearest shell first (`/2014/`) and only then
  the root.

`urlArgs: Date.now()` turned out to be a non-issue: the fetch handler already
matches with `ignoreSearch: true`, so RequireJS's cache-busting query string
still hits the precached module.

## Deploy, following the sanremo pattern exactly

`sanremo` is the reference: an nginx image with the built site baked in, pushed
to `docker.amatiasq.com`, and a compose file on the VPS.

1. `lulas/Dockerfile` + `lulas/nginx.conf` — nginx serving `dist/`.
2. `lulas/infra/compose.yml` — `VIRTUAL_HOST` and `LETSENCRYPT_HOST` set to
   `lulas.amatiasq.com,lulas.amq.im`, on the `exposed` network.
3. `lulas/amq/amq-lulas-deploy` — copy of `amq-sanremo-deploy`: buildx, push
   `:latest` and a timestamp tag, `amq deploy-infra lulas`,
   `amq vps pull-and-restart lulas`.
4. `dns/shared.ts` — add `...AAAA('lulas')` under "projects".
5. Optionally `.github/workflows/ci-lulas.yml` delegating to `amq lulas check`,
   like `ci-sanremo.yml`.

`AGENTS.md`'s "Deployment: none yet" section gets rewritten when this lands.

## Order

1. ~~`amq lulas build-versions` with `/2014` only, verified running in a
   browser.~~ **Done**, including the missing `ticker.js` (see
   [`../../versions/README.md`](../../versions/README.md)).
2. ~~Service worker.~~ **Done**, see above.
3. Dockerfile, compose, `amq lulas deploy`, DNS — the remaining work.
4. Optional, not asked for: a link back to `/` on the 2014 page, injected into
   the copy at build time. Right now someone who lands on `/2014` has no way
   back except editing the URL.
