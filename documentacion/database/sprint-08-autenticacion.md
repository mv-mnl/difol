# Database — Sprint 8: Autenticación y multi-usuario

## Cambio realizado
- **Sistema de migraciones nuevo**: `database/migrations/001_create_usuarios.sql`, `002_usuario_id_columns.sql`, `003_usuario_scoped_uniques.sql`. `init.sql` queda intacto (sigue siendo el esquema base que corre sólo en la primera inicialización del volumen de MySQL); las migraciones se aplican encima, en cualquier entorno (fresh o con datos), corridas por `backend/src/migrate.js` al arrancar el backend. Quedan registradas en una tabla nueva `schema_migrations (nombre, aplicada_en)`.
- **`001_create_usuarios.sql`**: tabla `usuarios (id, email UNIQUE, password_hash, nombre, created_at)`.
- **`002_usuario_id_columns.sql`**: agrega `usuario_id INT NULL` a `lugares`, `categorias` y `movimientos`, con `FOREIGN KEY ... ON DELETE CASCADE` hacia `usuarios(id)` (si se borra un usuario, se borran sus lugares/categorías/movimientos). Nace `NULL`-able a propósito: los datos que ya existían en la base no tienen dueño hasta que el primer usuario se registra (ver documentación de backend).
- **`003_usuario_scoped_uniques.sql`**: los `UNIQUE` que antes eran globales pasan a ser por usuario — `lugares` tenía `UNIQUE(nombre)` (índice autogenerado `nombre`), pasa a `UNIQUE(usuario_id, nombre)`; `categorias` tenía `UNIQUE(nombre, tipo)` (`uniq_categoria_nombre_tipo`), pasa a `UNIQUE(usuario_id, nombre, tipo)`.

## Decisiones y supuestos
- Verificado el nombre exacto de los índices a dropear contra la base real (`SHOW INDEX FROM lugares/categorias`) antes de escribir la migración — un `UNIQUE` inline en la definición de columna genera un índice con el mismo nombre que la columna (`nombre`), no algo genérico.
- Las tres migraciones se probaron contra el volumen real del proyecto (`difol_mysql_data`, con datos preexistentes de antes de este sprint) y quedan aplicadas de forma idempotente: reiniciar el backend después no reintenta ni falla.
- Este sistema de migraciones resuelve el pendiente que había quedado abierto en el Sprint 1 ("si se necesita aplicar un cambio de esquema más adelante, hay que decidir entre `docker compose down -v` o introducir migraciones — no resuelto todavía"). Cualquier cambio de esquema futuro debería ir como un archivo nuevo en `database/migrations/`, nunca editando `init.sql` ni las migraciones ya aplicadas.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
