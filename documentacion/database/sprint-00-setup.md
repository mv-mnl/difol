# Database — Sprint 0

## Cambio realizado
- `database/init.sql` como placeholder, montado en `docker-entrypoint-initdb.d` del contenedor MySQL (`mysql:8.4`). Solo crea la base `difol` si no existe.
- Servicio `mysql` en `docker-compose.yml` con volumen persistente `mysql_data` y healthcheck (`mysqladmin ping`) del que dependen backend.
- Puerto expuesto al host remapeado a `3307:3306` porque el `3306` ya estaba ocupado por otro contenedor MySQL (`mysql_db`) preexistente en la máquina. La conexión interna backend↔mysql sigue usando el puerto `3306` dentro de la red de Docker, sin cambios.

## Próximo cambio (Sprint 1)
- Definir esquema real en `init.sql` (o migraciones separadas): tablas `movimientos`, `categorias`, `lugares`, con `categorias.tipo` (ingreso/egreso) y relaciones (FK de movimiento a categoría y lugar).
