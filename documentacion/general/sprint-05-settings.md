# Sprint 5 — Settings

## Cambio realizado
- Nueva tab "Settings" con dos secciones: **Cuentas** (CRUD de `lugares`) y **Categorias** (CRUD de `categorias`, agrupadas por tipo ingreso/egreso).
- Sprint puramente de frontend: los endpoints CRUD de `lugares` y `categorias` ya existían desde el Sprint 1, no hizo falta tocar el backend.
- Decisión de producto: desde la UI solo se puede editar el **nombre** de una categoria, no su `tipo`. Cambiar el tipo de una categoria que ya tiene movimientos asociados dejaría datos inconsistentes (el backend no valida esto en el `UPDATE`), así que se evita el problema restringiendo la UI en vez de agregar esa validación al backend ahora.
- Verificado con `docker compose up` + `curl`: alta/edición/borrado de cuentas y categorías, y el caso de borrado bloqueado por FK (no se puede eliminar un lugar con movimientos asociados — responde 409 con mensaje claro).
- No hizo falta el `docker compose restart backend` de sprints anteriores porque no se tocaron rutas del backend.

## Detalle
- Frontend: ver `documentacion/frontend/sprint-05-settings.md`

## Próximo cambio (Sprint 6)
- Pulido general: revisar que toda la documentación esté al día, manejo de errores y validaciones finales, ajustes de UX.
- Preparar deploy con Docker en modo producción (hasta ahora todo corrió en modo dev con `node --watch` / `vite --host`).
