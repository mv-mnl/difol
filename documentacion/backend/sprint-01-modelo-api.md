# Backend — Sprint 1

## Cambio realizado
- `src/routes/lugares.routes.js`: CRUD completo (`GET/POST/PUT/DELETE /api/lugares`). Nombre único; borrar un lugar referenciado por movimientos devuelve 409 (`ER_ROW_IS_REFERENCED_2`).
- `src/routes/categorias.routes.js`: CRUD completo (`GET/POST/PUT/DELETE /api/categorias`). `GET` acepta `?tipo=ingreso|egreso`. Único por (`nombre`, `tipo`).
- `src/routes/movimientos.routes.js`: CRUD completo (`GET/POST/PUT/DELETE /api/movimientos`). `GET` acepta filtros `?tipo=`, `?desde=`, `?hasta=` y devuelve joins con nombre de categoría y lugar.
- Validación centralizada en `validarMovimiento()`: `tipo` debe ser ingreso/egreso, `monto` numero positivo, `fecha` obligatoria, `lugar_id` obligatorio y debe existir, `categoria_id` opcional pero si viene debe existir **y coincidir con el tipo del movimiento**.
- `src/index.js`: registra las 3 rutas bajo `/api/*` y agrega un middleware de manejo de errores centralizado (500 genérico + log en consola).

## Próximo cambio (Sprint 2)
- Nada pendiente en backend para el CRUD base; el siguiente trabajo de backend llega en Sprint 3 (endpoint de balance) y Sprint 4 (endpoints de agregación para métricas).
