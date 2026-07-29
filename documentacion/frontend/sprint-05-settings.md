# Frontend — Sprint 5

## Cambio realizado
- `src/api.js`: wrappers `crearLugar`/`actualizarLugar`/`eliminarLugar` y `crearCategoria`/`actualizarCategoria`/`eliminarCategoria`. Se agregó un helper `sendJson` interno y se reusó en `crearMovimiento` para no duplicar el patrón fetch+JSON.
- `src/components/CuentasManager.jsx`: lista de cuentas (lugares) con alta (form simple), edición inline (click en "Editar" muestra un input) y borrado con `window.confirm`. Muestra el error del backend tal cual (por ejemplo, el 409 por nombre duplicado o por lugar en uso).
- `src/components/CategoriasManager.jsx`: mismo patrón pero con dos columnas fijas (Gastos / Ingresos) reutilizando un subcomponente interno `ColumnaTipo`. Solo permite editar el `nombre`, no el `tipo` (ver nota de producto en `documentacion/general/sprint-05-settings.md`).
- `src/pages/Settings.jsx`: combina ambos managers con una breve descripción de cada sección.
- `App.jsx` + `App.css`: tab "Settings" y estilos de listas/formularios reutilizados del patrón ya usado en Metricas (`metricas-grid`, `chart-empty`).

## Próximo cambio (Sprint 6)
- Sin cambios de frontend previstos más allá del pulido general (Sprint 6).
