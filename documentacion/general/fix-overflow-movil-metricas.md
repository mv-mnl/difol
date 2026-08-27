# Fix: overflow en Métricas en móvil

## Cambio realizado
Fix puramente de frontend (CSS): se corrigió el desborde horizontal que aparecía en la pantalla de Métricas al verla en un dispositivo móvil. No hizo falta tocar backend ni base de datos.

Causas encontradas y corregidas en `frontend/src/App.css`:
- Grids (`.metricas-grid`, `.stats-grid`) con un ancho mínimo de columna fijo (`minmax(260px, 1fr)`) que no cabía en viewports angostos.
- Encabezado de la sección "Por categoria y lugar" sin `flex-wrap`.
- Gráficos de barras con muchas columnas ("por día del mes" — 31, "diversificación de categorías por mes" — 24) sin scroll horizontal propio, por lo que se recortaban en vez de desplazarse.
- Segunda vuelta: las etiquetas de `LineChart` (usado en "Balance acumulado" y "Promedio móvil", con 24 puntos) se partían en dos líneas y seguían desbordando la tarjeta. Un primer intento agregó scroll horizontal (como el heatmap), pero se descartó: un gráfico de tendencia pierde el sentido si hay que scrollearlo para verlo completo. Solución final, aplicada también a `VerticalBarChart` y `MonthlyTrendChart`: las barras/la línea se dibujan completas siempre, y solo se recorta cuántas etiquetas de eje se muestran (máx. ~8), dejando que columnas/barras se angosten libremente en vez de desbordar o requerir scroll.
- Tercera vuelta: ya sin overflow, la pantalla seguía sintiéndose muy densa/larga en el celular (7 secciones con varios gráficos, todas abiertas y apiladas). Se convirtieron las 7 secciones en un acordeón (`<details>`/`<summary>` nativos, sin JS extra): solo "Flujo de dinero" arranca abierta, el resto colapsadas. Elegido por el usuario entre 3 alternativas presentadas (acordeón, resumen + detalle expandible, simplificar gráficos a números grandes).
- Cuarta vuelta: probado el acordeón, no gustó — se revirtió completo a secciones siempre visibles como estaban antes del cambio 3.
- Quinta vuelta: el usuario precisó que los gráficos se ven "chicos/apretados" y no le convence "el estilo (colores, forma)". Se usó la skill `dataviz` (specs de marcas + validador de paletas por código, no a ojo) para dos arreglos: (1) el verde usado como TEXTO de balance/monto tenía contraste 2.74:1, por debajo del mínimo legible de texto — se separó color de marca de gráfico (se mantiene) de color de texto (pasa a un verde/rojo con contraste válido); (2) grosor y redondeo de barras/línea/puntos aumentado siguiendo la spec de marcas (barras más gruesas, redondeo solo en la punta del dato, línea de referencia en cero pasó de punteada a sólida).

## Detalle
- Frontend: ver `documentacion/frontend/fix-overflow-movil-metricas.md`

## Próximo cambio
- Ninguno previsto. Sugerido: verificar visualmente en un dispositivo real o emulador la próxima vez que se trabaje en Métricas.
