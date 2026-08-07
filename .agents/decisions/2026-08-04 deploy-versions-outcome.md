# 2026-08-04 — `lulas.amatiasq.com`, con las versiones viejas al lado

Hecho y en producción. Este registro se escribe **a posteriori**: la
infraestructura se desplegó sin dejar constancia y el plan seguía diciendo "half
done" cuando ya llevaba tiempo sirviendo. Lo que sirve cada URL está en
`nginx.conf` y en `AGENTS.md`.

Se añade `.github/workflows/ci-lulas.yml`, que el plan dejaba como opcional y el
`AGENTS.md` de la raíz da por obligatorio. Se dispara también con cambios en
`npm/**`: lulas consume `@amatiasq/quadtree` y `@amatiasq/geometry` por
workspace, así que un cambio ahí cambia contra qué se construye.

Lo que se deja fuera, y por qué:

- **`versions.html`**, el índice que proponía el plan. El `README.md` ya explica
  qué es cada versión y enlaza a `/2014`, y el requisito de fondo — «el exhibit
  sólo es honesto si cada versión dice qué funciona en ella» — lo cumple el
  propio README más el aviso inyectado en la copia de 2014. Una página más para
  dos entradas es interfaz que nadie pidió.
- **El enlace de vuelta desde `/2014` a `/`**: el plan ya lo marcaba como no
  pedido. Sigue sin pedirse.
- **`/2018` y `/2020`**: no tienen especies, así que no hay nada que mirar.
