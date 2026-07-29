# Database — Sprint 1

## Cambio realizado
- `database/init.sql` ahora define el esquema completo:
  - `lugares(id, nombre UNIQUE)`
  - `categorias(id, nombre, tipo ENUM('ingreso','egreso'), UNIQUE(nombre, tipo))`
  - `movimientos(id, tipo ENUM, monto DECIMAL(12,2), fecha DATE, descripcion, categoria_id NULL FK, lugar_id NOT NULL FK, created_at)`
- `categoria_id` usa `ON DELETE SET NULL` (la categoría es opcional en el movimiento); `lugar_id` usa `ON DELETE RESTRICT` (el lugar es obligatorio, no se puede borrar un lugar en uso).
- Seed inicial vía `INSERT ... ON DUPLICATE KEY UPDATE` para lugares y categorías básicas, para tener datos de prueba apenas se levanta el contenedor.

## Nota
- `init.sql` solo corre en la primera inicialización del volumen de MySQL (comportamiento estándar de la imagen oficial). Para aplicar cambios de esquema en un entorno ya inicializado hace falta `docker compose down -v` (recrear el volumen) o escribir una migración aparte — a definir cuando haya datos reales que no se puedan perder.

## Próximo cambio
- Sin cambios de esquema previstos hasta Sprint 3/4 (agregaciones de balance y métricas), que probablemente se resuelvan con queries, no con nuevas tablas.
