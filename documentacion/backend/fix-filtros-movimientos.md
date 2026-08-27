# Backend — Filtros por categoría y lugar en movimientos

## Cambio realizado
`src/routes/movimientos.routes.js`: `GET /api/movimientos` ahora acepta también `?categoria_id=` y `?lugar_id=` (antes solo soportaba `tipo`/`desde`/`hasta`, ver `sprint-01-modelo-api.md`). Se agregan como condiciones `WHERE` opcionales más, igual que las existentes — sin validación de que el id exista, consistente con cómo ya se trataba `tipo` (si no matchea nada, la lista simplemente sale vacía). Motivado por el frontend de `documentacion/frontend/vista-movimientos-editar.md` (cambio 2), que necesitaba filtrar la vista de Movimientos por categoría y lugar además de tipo/fecha.

## Próximo cambio
- Ninguno previsto.
