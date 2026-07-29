# Backend — Sprint 6

## Cambio realizado
- `src/validation.js`: `esFechaValida(str)` (formato `YYYY-MM-DD` + fecha real, rechaza cosas como `2026-13-01`) y `validarRangoFechas({desde, hasta})` (formato de ambos + que `desde` no sea posterior a `hasta`).
- Aplicado en:
  - `balance.routes.js`: valida `desde`/`hasta` antes de armar la query.
  - `movimientos.routes.js`: valida `desde`/`hasta` en el `GET`, y `fecha` (formato, no solo presencia) en `validarMovimiento()` usado por `POST`/`PUT`.
  - `metricas.routes.js`: valida `desde`/`hasta` en `por-categoria` y `por-lugar`.
- `Dockerfile.prod`: imagen de producción, `npm install --omit=dev`, `NODE_ENV=production`, `CMD ["npm", "start"]` (sin `--watch`).

## Próximo cambio
- Ninguno planeado — el roadmap de 6 sprints está completo. Si se retoma el proyecto, evaluar: autenticación/multi-usuario, tests automatizados, y (si el quirk de `node --watch` vuelve a aparecer seguido) cambiar a `nodemon` con polling explícito en dev.
