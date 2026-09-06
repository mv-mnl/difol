# Frontend — Filtros de periodo y ventana en Métricas

## Contexto
El usuario notó que la pantalla de Métricas no tenía forma de elegir el rango de tiempo: cada sección traía su propia ventana fija y distinta entre sí (resumen/categoría/lugar/heatmap = mes en curso; evolución del año = año calendario actual; hábitos = últimos 12 meses; serie mensual/avanzadas = últimos 24 meses). Antes de tocar código se propuso el diseño y se confirmaron dos decisiones con el usuario (semana empieza en lunes; comparar-con-periodo-anterior queda para un cambio futuro, no se agrega ahora).

## Cambio realizado
Se identificó que las secciones de Métricas caen en dos categorías con necesidades distintas, así que se agregaron **dos selectores independientes** en vez de uno solo:

- **Periodo** (`pages/Metricas.jsx`, estado `periodo`): afecta las secciones "foto" — resumen, por categoría, por lugar y el heatmap lugar×categoría — que ya aceptaban `desde`/`hasta` en el backend. Opciones: Esta semana / Este mes (default) / Este trimestre / Este año / Personalizado (con inputs `type="date"`, mismo patrón ya usado en `Movimientos.jsx`).
- **Ventana de tendencia** (estado `ventana`, valores 6/12/24/36 meses, default 12): afecta las secciones que necesitan varios meses para tener sentido — balance acumulado, evolución de una categoría, hábitos, comparativas temporales y métricas avanzadas — que ya aceptaban `meses` (o un `desde` calculado a partir de meses) en el backend.

**No hizo falta tocar el backend**: todos los endpoints usados (`/resumen`, `/por-categoria`, `/por-lugar`, `/lugar-categoria`, `/serie-mensual`, `/categoria-evolucion`, `/habitos`, `/avanzadas`) ya soportaban `desde/hasta` o `meses` como parámetro; el trabajo fue 100% de cableado en el frontend.

Detalle de la implementación:
- `utils/fechas.js`: se agregaron `primerDiaDeLaSemana()` (lunes de la semana actual, vía `(getDay()+6)%7`), `primerDiaDelTrimestre()`, `primerDiaDelAnio()`, la constante `PERIODOS` (key + label de cada preset) y `rangoPeriodo(periodo)` que devuelve `{ desde, hasta }` para cualquier preset salvo "personalizado".
- `pages/Metricas.jsx`:
  - `desde`/`hasta` ahora se calculan con `useMemo` a partir de `periodo` (o de los inputs personalizados); reemplazan a las constantes fijas `desdeMes`/`hastaHoy` que existían antes.
  - Se separó el único `useEffect` de montaje en tres: uno de una sola vez (datos que no dependen de filtros: lugares para colores, año calendario, proyección del mes, calidad, histórico de lugares "todos los tiempos"), uno que depende de `[desde, hasta]` (resumen), y uno que depende de `[tipo, desde, hasta]` (categorías, por-categoría, por-lugar, lugar-categoria). La `ventana` quedó en dos efectos propios: `[ventana]` para serie-mensual y avanzadas, `[tipo, ventana]` para categoría-evolución y hábitos.
  - Se agregó una sección nueva "Filtros" al principio de la página con los dos `<select>` (reusando las clases `.field-row`/`.field` ya existentes) y los inputs de fecha cuando el periodo es "Personalizado".
  - Los títulos que tenían el rango hardcodeado en el texto ("este mes", "12 meses", "24 meses") pasaron a interpolar `periodoLabel` o `ventana` dinámicamente.
- La proyección del mes en curso (`/proyeccion-mes`) se dejó **sin** atar al selector de periodo — es intrínsecamente "mes en curso" (no tiene sentido proyectar una semana), y se le agregó la aclaración "(mes en curso)" en su etiqueta para que no se confunda con el resto de la sección, que sí sigue al periodo elegido.
- El histórico de "% en efectivo" / "cuenta más usada" (`getMetricasPorLugar({ tipo: "egreso" })`, sin fechas) tampoco se ató al periodo: ya estaba documentado en la UI como "Histórico, todos los gastos" y así se mantiene.

## Cambio realizado (2) — reordenar por grupo, no por tema
El usuario pidió separar visualmente qué depende de cada filtro: primero todo lo que depende de Periodo, después todo lo que depende de Ventana. Las secciones originales mezclaban ambos (p. ej. "Flujo de dinero" tenía el resumen del periodo *y* el gráfico de balance acumulado de N meses en la misma tarjeta). Se reordenó `pages/Metricas.jsx` en tres bloques, cada uno con un encabezado `<h2 className="metricas-grupo">` (estilo nuevo en `App.css`, uppercase + borde inferior, para que se lea como separador de grupo y no como título de una tarjeta más):

1. **Depende del Periodo**: Flujo de dinero (resumen + proyección), Por categoría y lugar, Heatmap categoría×lugar. El gráfico de balance acumulado y la sección "Evolución de una categoría" se sacaron de acá porque en realidad dependen de la Ventana, no del Periodo.
2. **Depende de la Ventana**: Balance acumulado, Evolución de una categoría, Hábitos, Comparativas temporales, Métricas avanzadas.
3. **Sin filtro (histórico completo / año calendario)**: Evolución del año en curso (siempre año calendario actual), Uso de lugares (% en efectivo / cuenta más usada — histórico, todos los gastos, sección nueva separada del heatmap donde vivía antes), Calidad de datos (histórico).

`% en efectivo` / `cuenta más usada` no dependen de ningún filtro (son histórico completo), así que se movieron del grupo Periodo al grupo Sin filtro en vez de dejarlos donde estaban solo porque compartían tarjeta con el heatmap.

## Cambio realizado (3) — filtros junto al grupo que afectan
El usuario pidió que cada filtro viva en la sección a la que aplica, no juntos en una tarjeta "Filtros" separada al principio. Se eliminó esa tarjeta y cada selector se movió al encabezado del grupo que controla:

- El `<select>` de Periodo (+ los inputs de fecha cuando es "Personalizado") ahora vive dentro del encabezado "Depende del Periodo".
- El `<select>` de Ventana de tendencia ahora vive dentro del encabezado "Depende de la Ventana".
- El encabezado "Sin filtro" no tiene ningún selector (no le corresponde ninguno).

`App.css`: el estilo de separador (borde inferior, mayúsculas) que antes vivía en `.metricas-grupo` (el `<h2>`) se separó en dos: `.metricas-grupo` quedó solo con tipografía, y el borde/espaciado pasó a un contenedor nuevo `.metricas-grupo-header` (flex, `justify-content: space-between`, envuelve el `<h2>` y el `field-row` del selector correspondiente) para que el título y el control queden en la misma fila.

## Próximo cambio
- Pendiente (a pedido explícito del usuario, no en este cambio): agregar un toggle "comparar con periodo anterior" junto al selector de Periodo, generalizando el patrón que hoy solo usa `ComparativaCard` para meses (mes anterior / mismo mes año anterior) a cualquier preset (semana pasada, trimestre pasado, año pasado).
