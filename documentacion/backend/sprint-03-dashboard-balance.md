# Backend — Sprint 3

## Cambio realizado
- `src/routes/balance.routes.js`: `GET /api/balance?desde=&hasta=` agrupa `SUM(monto)` por `tipo` con filtro opcional de rango de fechas, y responde `{ ingresos, egresos, balance }` (`balance = ingresos - egresos`). Sin filtros, calcula sobre todo el historial.
- Registrado en `src/index.js` junto a los routers existentes.

## Nota de entorno (dev)
- Con `node --watch` sobre un bind mount, un evento espurio de montaje puede disparar un reinicio con el grafo de módulos a medias, dejando una ruta nueva sin registrar aunque el archivo esté correcto en disco. Mitigación: `docker compose restart backend` si una ruta recién agregada responde 404 de forma inesperada.

## Próximo cambio (Sprint 4)
- Endpoints de agregación: gasto por mes, por categoría y por lugar (probablemente `GET /api/metricas/...` con `GROUP BY` sobre `categoria_id` / `lugar_id` / mes de `fecha`).
