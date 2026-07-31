# Frontend — Sprint 7

## Cambio realizado
- `src/api.js`: funciones nuevas para los 8 endpoints agregados (`getMetricasResumen`, `getMetricasSerieMensual`, `getMetricasProyeccionMes`, `getMetricasCategoriaEvolucion`, `getMetricasLugarCategoria`, `getMetricasHabitos`, `getMetricasCalidad`, `getMetricasAvanzadas`).
- Componentes nuevos, todos siguiendo el patrón ya establecido en Sprint 4 (sin librería de charts, tooltip vía `data-tooltip` + CSS `::after`, sin JS adicional):
  - `StatTile.jsx`: tarjeta genérica label/valor/sub para números sueltos (promedio, mediana, racha, etc.).
  - `ComparativaCard.jsx`: valor actual vs. una referencia (mes anterior / mismo mes año anterior), con variación absoluta y %, coloreada en verde/rojo según si la variación es favorable (`favorableSiSube` — un aumento es bueno en ingresos, malo en egresos, reutilizando las clases `.positivo`/`.negativo` que ya existían para el balance en Dashboard).
  - `VerticalBarChart.jsx`: barras verticales delgadas genéricas — reusado para distribución por día del mes (31 barras), estacionalidad por mes calendario (12 barras) y diversificación de categorías por mes.
  - `LineChart.jsx`: línea SVG genérica multi-serie (polyline + `viewBox` 0-100 relativo, sin ejes numéricos, igual que `MonthlyTrendChart`), con marcadores HTML superpuestos (posicionados en %) que llevan el tooltip — evita los problemas de `::after` dentro de `<svg>`. Soporta línea punteada (promedio móvil), línea base en cero, y color de marcador por signo (para el balance acumulado, que puede ser negativo).
  - `Heatmap.jsx`: matriz lugar × categoría; cada celda se pinta con `tonoSecuencial` (un solo tono, intensidad por opacidad relativa al máximo de la matriz) — es la escala secuencial de un solo hue que pide la guía de dataviz, implementada con alpha en vez de una rampa de pasos discretos por simplicidad.
  - `theme/colors.js`: se agregó `tonoSecuencial(hexBase, valor, max)` para el heatmap.
- `pages/Metricas.jsx` se reescribió organizando todo en 8 secciones que calcan `metricas_movimientos.md` (menos presupuesto). La mayoría de las métricas derivadas (comparativas, promedio móvil, estacionalidad, "categoría con mayor variación") se calculan en el frontend con `useMemo` a partir de `serie-mensual` (24 meses) y `categoria-evolucion` (12 meses) para no multiplicar endpoints por cada cálculo derivado.
- `utils/fechas.js`: se agregó `primerDiaHaceMeses(n)` (usado para pedir hábitos sobre los últimos 12 meses, no solo el mes en curso) y se movió `MESES_ABR` acá (antes vivía duplicado dentro de `MonthlyTrendChart.jsx`).
- `App.css`: estilos nuevos para `stat-tile`, `comparativa-card`, `vbar-chart`, `linechart` y `heatmap`, reusando la paleta y el patrón de tooltip ya validados en Sprint 4.
- Verificado en navegador con Playwright headless (`chromium-cli` no estaba disponible en este entorno; se instaló Chromium vía `npx playwright install chromium` y se armó un script ad-hoc) contra `docker compose up`: las 8 secciones cargan con datos reales, sin errores de consola, con el toggle en Gastos y en Ingresos.

## Próximo cambio
- Ninguno previsto — la sección de Métricas queda cerrada salvo que se agregue Presupuesto más adelante.
