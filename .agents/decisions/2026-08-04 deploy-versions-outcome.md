# 2026-08-04 — `lulas.amatiasq.com`, con las versiones viejas al lado

**Hecho y en producción**; el registro se escribe a posteriori, porque la
infraestructura se desplegó sin dejar constancia y el plan seguía diciendo «half
done» cuando ya llevaba tiempo sirviendo. Lo que sirve cada URL está en
`nginx.conf` y en [`AGENTS.md`](../../AGENTS.md).

- `.github/workflows/ci-lulas.yml` se dispara también con los cambios en
  `npm/**`: lulas consume `@amatiasq/quadtree` y `@amatiasq/geometry` por
  workspace, así que un cambio ahí cambia contra qué se construye.
- Fuera, y por qué: `versions.html` —el `README.md` ya dice qué es cada versión
  y enlaza a `/2014`, y una página más para dos entradas es interfaz que nadie
  pidió—, el enlace de vuelta desde `/2014`, que sigue sin pedirse, y `/2018` y
  `/2020`, que no tienen especies y no hay nada que mirar.
