# Backend — Sprint 4

## Cambio realizado
- `src/routes/metricas.routes.js`, montado en `/api/metricas`:
  - `GET /por-categoria?tipo=&desde=&hasta=`: requiere `tipo`; agrupa por `categoria_id` (LEFT JOIN, incluye movimientos sin categoría como `"Sin categoria"`), ordenado por total desc.
  - `GET /por-lugar?tipo=&desde=&hasta=`: `tipo` opcional; agrupa por `lugar_id` (siempre presente, `lugar_id` es NOT NULL en el esquema).
  - `GET /por-mes?anio=YYYY`: agrupa por mes y tipo con `DATE_FORMAT(fecha, '%Y-%m')`, y devuelve los 12 meses del año completos (con ceros en los meses sin movimientos), no solo los meses con datos — para que el frontend no tenga que rellenar huecos.

## Próximo cambio (Sprint 5)
- Sin cambios de backend previstos más allá de reutilizar los endpoints de categorías/lugares ya existentes desde la UI de Settings.
