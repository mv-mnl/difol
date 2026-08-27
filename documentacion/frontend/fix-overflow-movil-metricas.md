# Frontend — Fix: overflow en Métricas en móvil

## Cambio realizado
Se corrigió el desborde horizontal de la página de Métricas (`pages/Metricas.jsx`) al verse en dispositivos móviles. Todo el cambio fue en `App.css`, sin tocar componentes ni lógica:

- `.metricas-grid` y `.stats-grid`: usaban `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` (y `minmax(140px, 1fr)`). En viewports angostos, una vez restados los paddings de `.app` y `.metricas section`, el ancho disponible caía por debajo de 260px, pero `minmax()` forzaba igual esa columna mínima y el grid desbordaba el contenedor. Se cambió a `minmax(min(260px, 100%), 1fr)` (idem 140px) para que el mínimo nunca exceda el ancho real disponible.
- `.metricas-header`: le faltaba `flex-wrap: wrap`. El título ("Por categoria y lugar") y el selector Gastos/Ingresos no cabían en una sola fila en pantallas chicas y se salían del contenedor.
- `.trend-chart` (usado por `MonthlyTrendChart`, 12 meses) y `.vbar-chart` (usado por `VerticalBarChart` — 31 columnas en "por día del mes", 24 en "diversificación de categorías por mes", 12 en estacionalidad): eran `flex` con columnas de ancho fijo/con contenido no compresible, así que con muchas columnas el contenido se salía de la caja y quedaba recortado por el `overflow-x: hidden` del `body` (visualmente se veían columnas cortadas a la derecha). Ver "Cambio realizado (2)" — se resolvió finalmente dejando que las barras se angosten libremente y recortando el rotulado, no con scroll.
- Se agregó una media query `@media (max-width: 480px)` que reduce el padding de `.app` y de `.metricas section`, y angosta las columnas fijas de `.bar-row` (de `96px 1fr 76px` a `72px 1fr 64px`) para ganar espacio útil en pantallas muy chicas.

El heatmap (`Heatmap.jsx`, `.heatmap`) ya estaba correctamente envuelto en `.table-scroll` con `overflow-x: auto`, así que no necesitó cambios.

## Cambio realizado (2)
Tras el fix anterior seguía viéndose overflow en móvil, esta vez en `LineChart.jsx` (usado por "Balance acumulado" y "Promedio móvil", ambos con 24 puntos, y "Evolución de una categoría" con 12). La causa: `.linechart-labels` es un `flex` con `justify-content: space-between` y sin control de overflow; con muchos puntos, cada etiqueta (ej. "Ene 25") se encogía por debajo de su contenido y el texto partía en dos palabras ("Ene" arriba, "25" abajo), y aun así la fila completa desbordaba el ancho de la tarjeta.

Primer intento: envolver el gráfico en un contenedor con `overflow-x: auto` y dejarlo scrollear horizontalmente (mismo patrón que la tabla de movimientos / heatmap). Se descartó a pedido del usuario — un gráfico de tendencia pierde su propósito (verlo de un vistazo) si hay que scrollearlo, y un scroll horizontal anidado dentro de una página que ya scrollea verticalmente es una mala experiencia táctil en general.

**Solución final: recortar el rotulado del eje, no el contenido.** Se aplicó el mismo criterio a los tres gráficos multi-columna de la página (`LineChart`, `VerticalBarChart`, `MonthlyTrendChart`):
- Cada componente calcula un `paso = Math.ceil(cantidadDePuntos / 8)` y solo renderiza texto de etiqueta para los índices múltiplos de `paso`, incluyendo siempre el primero y el último. La línea/los puntos/las barras se siguen dibujando completos — solo se reduce cuánto texto de eje se muestra (máx. ~8 etiquetas), independientemente del ancho de pantalla.
- `App.css`: se revirtieron los `overflow-x: auto` / `flex: 1 0 auto` / `min-width` fijos agregados en el primer intento. `.vbar-col` y `.trend-month` vuelven a `flex: 1` (se angostan libremente, ya tenían `min-width` en los elementos de barra — `3px`/`4px` — para no desaparecer del todo). `.trend-bar` pasó de `width: 10px` fijo a `flex: 0 1 10px; min-width: 3px;` para que el par de barras ingreso/egreso de cada mes se achique en conjunto en vez de forzar overflow.
- `.linechart-labels` pasó de fila `flex` a un contenedor `position: relative` con cada `<span>` posicionado en `left: X%` (igual que ya se hacía con `.linechart-dot`), así las etiquetas que sí se muestran quedan alineadas exactamente bajo su punto correspondiente aunque se hayan salteado etiquetas intermedias.

## Cambio realizado (3) — rediseño a acordeón
Resuelto el overflow, el usuario planteó que aun sin desbordarse, la pantalla de Métricas se siente muy apretada/larga en el celular: son 7 secciones con varios gráficos cada una, todas abiertas y apiladas en una sola columna. Se le ofrecieron 3 direcciones de rediseño (acordeón colapsable, resumen + detalle expandible, simplificar los gráficos a números grandes/sparklines) y eligió **acordeón por sección**.

Implementación en `pages/Metricas.jsx`: las 7 `<section>` pasaron a ser `<details className="metricas-section">`, con el título dentro de `<summary><h2>...</h2></summary>`. Es HTML nativo (`<details>`/`<summary>`), sin JS ni estado de React agregado — cada `<details>` maneja su propio abierto/cerrado en el DOM, consistente con el estilo "sin librerías" del resto de la app. Solo la primera sección ("Flujo de dinero") tiene el atributo `open` por defecto; el resto arrancan colapsadas. El toggle Gastos/Ingresos (antes agrupado junto al `<h2>` en `.metricas-header`) se movió a ser el primer elemento del contenido colapsable en vez de vivir dentro del `<summary>`, porque un click en el radio dentro de un `<summary>` también dispara el toggle de abrir/cerrar del `<details>` (el evento burbujea).

`App.css`:
- `.metricas section` → `.metricas-section` (selector por clase en vez de por tag, ya que ahora es un `<details>`).
- Estilos nuevos para `.metricas-section > summary`: cursor pointer, se oculta el marcador nativo del navegador (`::-webkit-details-marker` y `list-style:none`) y se dibuja uno propio (`▸`/`▾` vía `::before`, rota 90° cuando `[open]`), con `:focus-visible` para navegación por teclado.
- Se eliminó `.metricas-header` (ya no existe ese contenedor) y se agregó `.metricas-toggle` para el grupo de radios Gastos/Ingresos.

Como `open` se pasa como atributo booleano constante por sección (no ligado a un estado de React), React no vuelve a tocarlo en renders posteriores — el usuario puede abrir/cerrar libremente sin que un re-render (p. ej. al cambiar el toggle Gastos/Ingresos) le pise el estado.

## Cambio realizado (4) — revertido el acordeón
El usuario probó el acordeón y no le gustó. Se revirtió por completo: las 7 `<details>/<summary>` volvieron a ser `<section>` con `<h2>` normal, siempre visibles (como estaban antes del cambio 3). Se restauró `.metricas-header` (title + toggle Gastos/Ingresos juntos) y se eliminó todo el CSS del acordeón (marcador `::before`, `:focus-visible` del summary, `.metricas-toggle`). Las secciones conservan la clase `.metricas-section` para el estilo de tarjeta (fondo blanco, borde, padding), que ya no depende de si el tag es `<section>` o `<details>`.

Quedan vigentes los cambios 1 y 2 (grids que no fuerzan overflow, gráficos que recortan el rotulado del eje en vez de desbordar/scrollear) — el usuario aclaró que lo que no le gustó fue puntualmente el acordeón, más algo en el aspecto visual de los gráficos en sí que todavía no especificó (pendiente de definir en el próximo cambio).

## Cambio realizado (5) — tamaño y color de las marcas
El usuario precisó qué no le gustaba: se ven "muy chicos/apretados" y no le convence "el estilo visual (colores, forma)". Se aplicó la skill `dataviz` del propio harness (specs de forma/marca + el validador de paletas en `scripts/validate_palette.js`) en vez de ajustar a ojo:

**Colores — bug real, no solo gusto.** El validador mostró que el verde de "ingreso" usado como texto (`#1baf7a` en `.amount.positivo`, `.comparativa-variacion.positivo`, `.movimientos-list .tipo-ingreso .monto`) tiene contraste 2.74:1 sobre fondo claro — por debajo del mínimo de 4.5:1 para texto normal (WCAG), lo que lo hace ver lavado/difícil de leer. Además el rojo de egreso (`#c0392b`) no era un color documentado del sistema. Fix:
- `theme/colors.js`: `EGRESO_COLOR` pasó de `#c0392b` a `#d03b3b` (rojo "critical" del set de status documentado; contraste 4.68, valida CVD ΔE 9.9 contra el verde de marca — bien arriba del piso de 8). `INGRESO_COLOR` se mantuvo en `#1baf7a` **solo para marcas de gráfico** (barras/puntos/líneas), donde el contraste 2.74 es aceptable porque siempre hay una etiqueta de valor al lado (relief).
- `App.css`: se separó el color de MARCA (chart) del color de TEXTO. Todo lugar donde el verde/rojo pintaba texto solo (sin fondo ni etiqueta) — `.amount.positivo/.negativo`, `.comparativa-variacion.positivo/.negativo`, `.movimientos-list .tipo-ingreso/.tipo-egreso .monto`, el borde de `.anomalias-list li` — pasó a usar los tokens de texto documentados: `#006300` (success text) y `#d03b3b` (critical). Esto también corrige el balance del Dashboard (`.amount.positivo`), que usaba el mismo verde lavado.
- `LineChart.jsx` tenía `"#1baf7a"`/`"#c0392b"` hardcodeados a mano para el color por signo del balance acumulado (duplicando, sin saberlo, los mismos valores de `theme/colors.js`); se corrigió para importar `INGRESO_COLOR`/`EGRESO_COLOR` en vez de repetir los hex, así una sola fuente de verdad.
- Se removió el `stroke-dasharray` de `.linechart-zero-line` (línea de referencia en cero): una gridline punteada es un anti-patrón según la guía de marcas ("hairline sólida, nunca punteada"); ahora es sólida de 1px.

**Tamaño/forma de las marcas** (más presencia, menos "apretado"):
- `.bar-track`/`.bar-fill` (BarList): grosor 10px → 14px; el fill ahora redondea solo la punta (extremo del dato), recto contra el eje — antes tenía las dos puntas redondeadas como una píldora.
- `.vbar-track` (VerticalBarChart): 100px → 120px de alto; `.vbar-fill` redondeado 2px → 4px en la punta (antes también recto en la base, eso ya estaba bien).
- `.trend-bars`/`.trend-bar` (MonthlyTrendChart): 140px → 150px de alto (con `ALTURA_MAX` actualizado a juego en el componente), barras de 10px → 14px de grosor, redondeado 3px → 4px en la punta.
- `LineChart`: grosor de línea 1.2 → 2px con `stroke-linecap/linejoin: round`; alto del área de trazo 160px → 180px; el marcador de punto 8px → 9px (spec pide ≥8px).
- `.stat-tile-value`: 1.25rem → 1.375rem, y se le sacó `font-variant-numeric: tabular-nums` — un valor grande y suelto (figura hero/stat-tile) usa números proporcionales; tabular es para columnas de tabla/ticks de eje que necesitan alinear dígito a dígito, no para un número de tarjeta.

## Próximo cambio
- Ninguno previsto. Pendiente que el usuario confirme visualmente el resultado (levantando `docker compose up` y mirando la página en el celular).
