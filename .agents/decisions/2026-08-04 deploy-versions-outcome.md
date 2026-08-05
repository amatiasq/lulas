# `lulas.amatiasq.com`, con las versiones viejas al lado — cierre del plan

**Estado**: hecho y en producción. Este registro se escribe **a posteriori**: la
infraestructura se desplegó sin dejar constancia, y el plan
`plans/deploy-versions.md` seguía diciendo "half done" cuando ya llevaba tiempo
sirviendo.

## Lo que hay hoy, comprobado contra el dominio real (2026-08-04)

| URL | qué sirve |
| --- | --- |
| `https://lulas.amatiasq.com/` | la simulación actual |
| `.../2014/` | `recover/js-2014` — el original, RequireJS, sin bundler |
| `.../2026/` | `versions/2026`, copia congelada de estas fuentes, con esbuild |
| `.../sw.js` | precache de los 26 ficheros, `/2014` incluido |

`lulas.amq.im` responde también. El contenedor es `amq-lulas`
(`docker.amatiasq.com/lulas:latest`), con `infra/compose.yml` en
`vps/docker/lulas/` y el DNS declarado en `dns/shared.ts`.

Es decir: los cuatro puntos que el plan daba por pendientes (Dockerfile,
compose, `amq lulas deploy`, DNS) están hechos, y `AGENTS.md` ya tiene la
sección "Deployment" reescrita, que era la otra condición.

## Lo que se ha añadido al cerrarlo

`.github/workflows/ci-lulas.yml`, que el plan dejaba como opcional y el
`AGENTS.md` de la raíz da por obligatorio para un proyecto de primer nivel.
Delega en `amq lulas check` (tests con cobertura + typecheck + build) y se
dispara también con cambios en `npm/**`, porque lulas consume
`@amatiasq/quadtree` y `@amatiasq/geometry` por workspace: un cambio ahí cambia
contra qué se construye.

Verde en local antes de añadirlo: 94.93% de statements, build limpio.

## Lo que se deja fuera, y por qué

- **`versions.html`**, el índice que proponía el plan: no existe y no se añade.
  El `README.md` ya explica qué es cada versión y enlaza a `/2014`, y el
  requisito de fondo ("el exhibit solo es honesto si cada versión dice qué
  funciona en ella") lo cumple el propio `README` más el aviso inyectado en la
  copia de 2014. Una página más para dos entradas es interfaz que nadie pidió.
- **El enlace de vuelta desde `/2014` a `/`**: el plan lo marcaba como
  "opcional, no pedido". Sigue sin pedirse.
- **`/2018` y `/2020`**: recorte del autor del 2026-08-01. No tienen especies,
  así que no hay nada que mirar. Se quedan en `recover/`.
