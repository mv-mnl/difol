# Frontend — Sprint 2

## Cambio realizado
- `src/api.js`: helper de fetch centralizado (`getLugares`, `getCategorias(tipo)`, `getMovimientos`, `crearMovimiento`), con manejo de errores que propaga el mensaje del backend.
- `src/components/MovimientoForm.jsx`: formulario de carga con tipo (radio ingreso/egreso), monto, fecha (default hoy), lugar (select, obligatorio) y categoria (select, opcional, se recarga filtrada por `tipo` cada vez que cambia el radio). Validación básica en cliente (lugar y monto), la autoridad final sigue siendo el backend.
- `src/components/MovimientosList.jsx`: tabla simple de movimientos con fecha, lugar, categoria, descripcion y monto (signo +/- según tipo, color verde/rojo).
- `src/App.jsx`: ahora orquesta formulario + listado; al crear un movimiento recarga la lista completa (sin estado optimista, por simplicidad).
- `src/App.css`: estilos base para el formulario y la tabla.
- Se eliminó la pantalla de verificación de `/api/health` que existía desde el Sprint 0.

## Próximo cambio (Sprint 3)
- Introducir navegación entre pantallas (dashboard + carga) — hasta ahora había una sola pantalla, así que no hacía falta router.
- Reutilizar `src/api.js` para el nuevo endpoint de balance.
