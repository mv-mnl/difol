# Filtros de periodo y ventana en Métricas

## Contexto
El usuario preguntó si la pantalla de Métricas no debería tener más filtros (por mes, por semana, etc.), como sí los tiene la pantalla de Movimientos. Se analizó la pantalla antes de tocar código: cada una de las 8 secciones traía su propio rango de tiempo fijo y distinto (mes en curso, año calendario, 12 meses, 24 meses), sin ningún control para el usuario.

## Cambio realizado
Fix puramente de frontend: se agregaron dos selectores globales al principio de la página de Métricas, en vez de uno solo, porque las secciones tienen dos necesidades distintas:

- **Periodo** (Esta semana / Este mes / Este trimestre / Este año / Personalizado): para las secciones que muestran una "foto" de un rango puntual — resumen, por categoría, por lugar, heatmap lugar×categoría.
- **Ventana de tendencia** (6/12/24/36 meses): para las secciones que necesitan varios meses para tener sentido — balance acumulado, evolución de una categoría, hábitos, comparativas y métricas avanzadas.

No hizo falta tocar backend ni base de datos: los endpoints de métricas ya aceptaban rango de fechas o cantidad de meses como parámetro, simplemente no había forma de cambiarlos desde la pantalla.

Antes de implementar se confirmaron dos decisiones con el usuario: la semana empieza en lunes, y un futuro toggle de "comparar con el periodo anterior" (semana pasada, trimestre pasado, etc.) queda para un cambio posterior, no se agrega ahora.

## Cambio realizado (2)
El usuario pidió que la página se lea en bloques claros: primero todas las secciones que dependen del Periodo, después todas las que dependen de la Ventana. Se reordenó la página en 3 grupos con un encabezado visual separador cada uno: "Depende del Periodo", "Depende de la Ventana" y "Sin filtro" (año calendario actual y datos históricos, que no cambian con ningún selector).

## Cambio realizado (3)
Se sacó la tarjeta "Filtros" separada del principio: ahora cada selector vive junto al grupo de secciones al que afecta (el de Periodo dentro del encabezado "Depende del Periodo", el de Ventana dentro de "Depende de la Ventana"), en vez de estar todos juntos aparte.

## Detalle
- Frontend: ver `documentacion/frontend/filtros-metricas.md`

## Próximo cambio
- Agregar "comparar con periodo anterior" junto al selector de Periodo (pendiente, a pedido del usuario).
