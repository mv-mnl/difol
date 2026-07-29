# Sprint 4 — Métricas

## Cambio realizado
- Tres endpoints de agregación en el backend: por categoría, por lugar y por mes (año completo).
- Nueva tab "Metricas" en el frontend con: breakdown del mes actual por categoría y por lugar (con toggle ingreso/egreso), y un gráfico de evolución anual (ingresos vs egresos por mes).
- Gráficos hechos a mano (barras horizontales para categoria/lugar, barras agrupadas para la evolución mensual) en vez de sumar una librería de charts — no se justificaba la dependencia para dos tipos de gráfico simples.
- Colores: se validó la paleta categórica (azul/naranja/aqua, con "Otros" en gris para categorías más allá de las 3 primeras) y el par verde/rojo ya usado en Dashboard para ingreso/egreso, usando el script de la skill de dataviz para chequear separación CVD y contraste. El color de cada categoría/lugar se asigna por id estable (no por posición en la respuesta filtrada), para que no cambie al cambiar el rango de fechas.
- Verificado con `docker compose up` + `curl`: los 3 endpoints devuelven datos correctos, incluyendo el caso de movimientos sin categoría ("Sin categoria") y meses sin movimientos (en cero).
- Se repitió otra vez el quirk de `node --watch` ya documentado en el Sprint 3 (rutas nuevas devolviendo 404 hasta reiniciar el backend).

## Detalle por área
- Backend: ver `documentacion/backend/sprint-04-metricas.md`
- Frontend: ver `documentacion/frontend/sprint-04-metricas.md`

## Próximo cambio (Sprint 5)
- Settings: CRUD de categorías y cuenta desde la UI, reutilizando los endpoints de categorías/lugares ya existentes.
