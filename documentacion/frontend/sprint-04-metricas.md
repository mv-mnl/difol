# Frontend — Sprint 4

## Cambio realizado
- `src/api.js`: `getMetricasPorCategoria`, `getMetricasPorLugar`, `getMetricasPorMes`.
- `src/theme/colors.js`: paleta categórica (`buildColorMap`) que asigna color por **id** ordenado ascendente (no por posición en la respuesta filtrada), con un color "Otros" gris para lo que exceda los primeros 3 slots — así una categoría no cambia de color si el rango de fechas cambia y deja de aparecer otra. También define los colores fijos de ingreso (verde) / egreso (rojo), reutilizados de los que ya existían en Dashboard/MovimientosList.
- `src/components/BarList.jsx`: barras horizontales genéricas (categoria o lugar), con valor siempre visible como texto (no solo color) y tooltip on-hover vía CSS (`data-tooltip` + `::after`), sin JS adicional.
- `src/components/MonthlyTrendChart.jsx`: barras agrupadas por mes (ingreso/egreso), con leyenda y tooltip por barra.
- `src/pages/Metricas.jsx`: nueva página con toggle ingreso/egreso (recalcula categorias + colores + breakdown al cambiar), dos `BarList` (categoria, lugar) para el mes actual, y el `MonthlyTrendChart` para el año completo.
- `src/utils/fechas.js`: se extrajeron `primerDiaDelMes`/`hoy` (antes vivían solo en `Dashboard.jsx`) para reutilizarlas en `Metricas.jsx`.
- `App.jsx`: agregado el tab "Metricas". `App.css` ampliado con estilos de grid, barras y tooltips; el ancho máximo de la app pasó de 720px a 860px para que el grid de categoria/lugar respire.
- Colores validados con el script de la skill de dataviz (`validate_palette.js`) antes de fijarlos en el código — ver detalle en `documentacion/general/sprint-04-metricas.md`.

## Próximo cambio (Sprint 5)
- Settings: pantalla de administración de categorías (y cuenta), probablemente reutilizando `BarList`/estilos existentes para consistencia visual.
