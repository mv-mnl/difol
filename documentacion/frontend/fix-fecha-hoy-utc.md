# Fix: `hoy()` tomaba la fecha en UTC en vez de hora local (El Salvador)

## Problema

`frontend/src/utils/fechas.js` calculaba la fecha de "hoy" con:

```js
new Date().toISOString().slice(0, 10);
```

`toISOString()` siempre devuelve la fecha/hora en UTC, sin importar la zona horaria del navegador. El Salvador es UTC-6 (sin horario de verano), así que a partir de las 6:00 p.m. hora local, UTC ya está en el día siguiente — `hoy()` devolvía esa fecha adelantada un día.

Esto afectaba a cualquier pantalla que use `hoy()` para prellenar o comparar la fecha del día: el formulario de carga de movimientos, el Dashboard y Métricas. Ejemplo real: a las ~6:39 p.m. del 27 de agosto en El Salvador, `new Date().toISOString()` ya daba `2026-08-28T...`, mientras que `new Date().toString()` (hora local) mostraba correctamente `Thu Aug 27 ... GMT-0600`.

El resto del archivo (`primerDiaDelMes`, `primerDiaHaceMeses`) ya calculaba con los getters locales (`getFullYear`/`getMonth`/`getDate`), así que solo `hoy()` tenía la inconsistencia.

## Cambio realizado

```js
export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```

Ahora usa los getters locales del `Date`, igual que las otras funciones del archivo, así que refleja la fecha según la hora local del navegador del usuario en vez de UTC.

## Decisiones y supuestos

- No se tocó el backend ni la configuración de Docker: `TZ=America/El_Salvador` ya se resuelve correctamente en el contenedor del backend vía la ICU embebida en Node (confirmado antes) — el problema era exclusivamente este uso de `toISOString()` en el frontend, que corre en el navegador del usuario y no depende de la zona horaria del contenedor.
- Se revisó el resto del frontend y del backend (`grep toISOString`) y no hay otros usos de `toISOString()` con el mismo problema.
- La fecha sigue dependiendo de la zona horaria configurada en el navegador del usuario, no de una zona horaria fija de la app — es el comportamiento esperado para un campo que el usuario edita a mano en el formulario.

## Próximo cambio

Ninguno previsto — a definir con el usuario.
