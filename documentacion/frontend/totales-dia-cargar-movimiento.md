# Frontend — Totales del día en Cargar Movimiento

## Cambio realizado
En `pages/CargarMovimiento.jsx` se agregó un resumen de ingreso total y gasto total del día, sumando los movimientos que ya se traían para la lista "Movimientos de hoy" (no se agregó ningún endpoint nuevo — la suma es un `reduce` en el frontend sobre el mismo array que ya devuelve `getMovimientos({ desde: hoy, hasta: hoy })`).

- Se agregó `totales` (`useMemo` sobre `movimientos`): acumula `ingresos` y `egresos` según `m.tipo`.
- Se muestran dos `stat-card` (reusando `.stat-row`/`.stat-card`/`.amount.positivo`/`.amount.negativo`, el mismo patrón visual que ya usa `Dashboard.jsx` para el balance) arriba de la tabla de movimientos del día, solo cuando ya cargó y hay al menos un movimiento (`!loading && movimientos.length > 0`).

## Próximo cambio
- Ninguno previsto.
