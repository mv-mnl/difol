# Backend — Sprint 7

## Cambio realizado
- `src/routes/metricas.routes.js` gana 8 endpoints nuevos (los 3 de Sprint 4 se mantienen y se enriquecen):
  - `GET /por-categoria`: ahora también devuelve `cantidad`, `promedio` (por transacción) y `porcentaje` (del total del período).
  - `GET /por-lugar`: ahora también devuelve `cantidad`.
  - `GET /resumen?desde=&hasta=`: ingresos, egresos, balance, tasa de ahorro (`null` si no hubo ingresos) y cantidad de movimientos del período.
  - `GET /serie-mensual?meses=N` (máx. 60): serie continua de los últimos N meses (con ceros en los meses sin datos), con `balance` y `balanceAcumulado` (saldo corriendo) por mes — base para el balance acumulado, comparativas y estacionalidad en el frontend.
  - `GET /proyeccion-mes`: gasto/ingreso del mes en curso hasta hoy, proyectado linealmente según los días transcurridos vs. los días del mes.
  - `GET /categoria-evolucion?tipo=&meses=N`: total mensual por categoría (incluye "Sin categoria"), con los N meses completos aunque una categoría no tenga movimientos en alguno — para el gráfico de evolución de una categoría y el cálculo de "mayor variación" en el frontend.
  - `GET /lugar-categoria?tipo=&desde=&hasta=`: crosstab lugar × categoría (para la matriz/heatmap del frontend).
  - `GET /habitos?tipo=&desde=&hasta=&umbralHormiga=`: promedio, mediana, máx, mín, frecuencia semanal, total por día de la semana (`DAYOFWEEK`) y por día del mes (`DAY`), racha máxima sin movimientos (calculada en JS sobre las fechas distintas del período) y gastos "hormiga" (cantidad/total/% bajo `umbralHormiga`, default $5).
  - `GET /calidad`: % con descripción, % sin categoría, lugar y categoría menos usados (global, no filtrado por tipo ni fecha — incluye lugares/categorías con 0 movimientos vía `LEFT JOIN`).
  - `GET /avanzadas?meses=N`: ratio gasto fijo/variable (heurística por nombre de categoría — ver supuestos en `documentacion/general/sprint-07-metricas-completas.md`), correlación de Pearson entre ingreso y gasto mensual, diversificación (categorías de egreso distintas usadas por mes) y anomalías (categoría del mes actual con gasto > promedio histórico + 1.5 desviaciones estándar).
- La mediana y la racha sin movimientos se calculan en JS después de traer los montos/fechas crudos — MySQL 8.4 no tiene `PERCENTILE_CONT`, y la racha requiere iterar sobre fechas ordenadas, más simple fuera de SQL. El volumen de esta app (cientos-pocos miles de movimientos) hace que esto no sea un problema de rendimiento.
- Las fechas se leen con `DATE_FORMAT(fecha, '%Y-%m-%d')` en SQL en vez de convertir el `Date` que devuelve `mysql2` con `.toISOString()`, para evitar corrimientos de un día si el driver aplica timezone al objeto `Date`.

## Próximo cambio
- Ninguno previsto — la sección 6 (Presupuesto) del md quedó fuera de alcance (ver documentación general).
