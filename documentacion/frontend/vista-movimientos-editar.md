# Frontend — Vista de movimientos separada (editar/eliminar) + carga acotada al día

## Cambio realizado
Se separaron dos responsabilidades que antes vivían juntas en "Cargar movimiento": cargar un movimiento nuevo, y revisar/editar/eliminar movimientos ya cargados.

- `pages/CargarMovimiento.jsx`: la lista que se muestra debajo del formulario ya no trae todos los movimientos — ahora pide con `getMovimientos({ desde: hoy(), hasta: hoy() })`, así que solo se ven los movimientos cargados el día de hoy. Es de solo lectura (sin acciones de editar/eliminar), sigue siendo el flujo rápido de "cargar y listo".
- `pages/Movimientos.jsx` (nueva): pantalla dedicada para ver y editar el historial completo. Tiene filtros de tipo (todos/gasto/ingreso) y rango de fechas (desde/hasta, ambos opcionales) que se mandan directo al backend (`GET /api/movimientos` ya soportaba `tipo`/`desde`/`hasta`, no hizo falta tocar el backend). Al hacer click en "Editar" sobre una fila se abre el formulario de movimiento arriba de la tabla, precargado con esos datos; "Eliminar" pide confirmación (`window.confirm`) y llama `DELETE /api/movimientos/:id` (la ruta ya existía).
- `App.jsx`: nueva pestaña "Movimientos" entre "Cargar movimiento" y "Metricas".
- `api.js`: `getMovimientos` ahora acepta `{ tipo, desde, hasta }` (antes no tomaba parámetros); se agregaron `actualizarMovimiento(id, movimiento)` (`PUT`) y `eliminarMovimiento(id)` (`DELETE`) — ambas rutas ya existían en `movimientos.routes.js`, solo faltaban en el cliente.
- `components/MovimientoForm.jsx`: se le agregó modo edición. Sigue siendo el mismo componente que usa "Cargar movimiento" (sin `movimiento` prop → modo alta, como siempre), pero ahora acepta `movimiento` (el registro a editar), `onSaved` y `onCancel`. Con `movimiento` presente: precarga el formulario con esos valores, el submit llama `actualizarMovimiento` en vez de `crearMovimiento`, el botón dice "Guardar cambios" y aparece un botón "Cancelar". `Movimientos.jsx` monta este formulario con `key={editando.id}` para que al cambiar de fila a editar, React lo reinicie con los valores correctos en vez de arrastrar estado viejo.
- `components/MovimientosList.jsx`: acepta `onEdit`/`onDelete` opcionales; si están presentes agrega una columna "Acciones" con esos botones (reutiliza las clases `.settings-actions`/`.secundario` que ya existían para Settings). `CargarMovimiento` no pasa estas props, así que su tabla queda igual que antes (sin columna de acciones).
- `App.css`: el único agregado es `.movimiento-form .form-actions` (contenedor flex para agrupar "Guardar"/"Guardar cambios" + "Cancelar") y `.movimiento-form button.secundario` (variante gris para "Cancelar"); se movió `align-self: flex-start` del botón a ese contenedor.

## Próximo cambio
- Ninguno previsto. Pendiente que el usuario pruebe editar/eliminar contra la base real.
