# Sprint 1 — Modelo de datos y API base

## Cambio realizado
- Esquema MySQL definido en `database/init.sql`: `lugares`, `categorias` (con `tipo` enum ingreso/egreso) y `movimientos` (con `lugar_id` obligatorio y `categoria_id` opcional, FKs con `ON DELETE SET NULL` / `ON DELETE RESTRICT`).
- Seed inicial: lugares (Efectivo, Banco) y categorías básicas de ingreso/egreso.
- Endpoints CRUD completos para `lugares`, `categorias` y `movimientos` en el backend.
- Validación de movimientos: `tipo`, `monto`, `fecha` y `lugar_id` obligatorios; `lugar_id` debe existir; `categoria_id` es opcional pero si se envía debe existir y coincidir con el `tipo` del movimiento.
- Verificado end-to-end con `docker compose up` + `curl`: creación válida, rechazo por falta de lugar, rechazo por categoría de tipo incorrecto, y listado con joins a categoría/lugar.

## Detalle por área
- Backend: ver `documentacion/backend/sprint-01-modelo-api.md`
- Database: ver `documentacion/database/sprint-01-modelo-api.md`

## Próximo cambio (Sprint 2)
- Frontend: formulario de carga de movimientos (monto, tipo, categoría, lugar, fecha) conectado a `POST /api/movimientos`.
- Listado simple de movimientos recientes en el frontend.
