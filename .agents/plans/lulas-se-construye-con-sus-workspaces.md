# lulas se construye con sus workspaces

**Status:** ⚪ sin empezar (2026-10-12)

Que `amq lulas deploy` vuelva a construir la imagen: **hoy muere en `bun install
--frozen-lockfile` con `Workspace not found "../../npm/geometry"`**, porque el
`package.json` une lulas a `npm/` como workspace y el contexto del build es sólo
`web/lulas/`. Visto el 2026-10-12 al relanzar los deploys del VPS; el paso del
build no cambió ese día, así que ya estaba roto.

## Trabajo

1. Elegir cómo llega `npm/geometry` y `npm/quadtree` al build: contexto en la
   raíz de mono con un `.dockerignore` estrecho, o instalar las versiones
   publicadas como hace el espejo `push-to-lulas`.
2. Ajustar `Dockerfile` y `amq/amq-lulas-deploy` a esa elección.
3. `amq lulas deploy` y comprobar `https://lulas.amatiasq.com`.

## Criterios de aceptación

- `amq lulas deploy` sale 0 y la web sirve el build nuevo.
- `amq lulas check` sigue en verde.
