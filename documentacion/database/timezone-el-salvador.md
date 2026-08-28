# Zona horaria de El Salvador (base de datos)

## Cambio realizado
El servicio `mysql` en `docker-compose.yml` y `docker-compose.prod.yml` ahora recibe `TZ: ${TZ:-America/El_Salvador}`. No se tocó `database/init.sql` ni las migraciones: la imagen oficial `mysql:8.4` usa esa variable para fijar la hora del contenedor, y como `time_zone` del servidor queda en `SYSTEM` (el default, no seteado explícitamente en ningún lado del proyecto), `NOW()`/`CURRENT_TIMESTAMP` pasan a reportar hora de El Salvador (UTC-6, sin horario de verano) en vez de UTC.

Afecta directamente a `movimientos.created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (`database/init.sql`) y a cualquier `NOW()`/`CURDATE()` que se use en queries futuras. La columna `movimientos.fecha` es `DATE` (sin hora) y la sigue mandando el backend explícitamente, así que no depende de esta config.

## Decisiones y supuestos
- Verificado en un contenedor `mysql:8.4` de prueba: con `TZ=America/El_Salvador`, `SELECT NOW(), UTC_TIMESTAMP()` muestra la hora local en `NOW()` y UTC en `UTC_TIMESTAMP()`, con `@@system_time_zone = CST` y `@@global.time_zone = SYSTEM`.
- No se usó `--default-time-zone` de mysqld ni un `SET GLOBAL time_zone` en `init.sql` porque `TZ` en el contenedor ya alcanza para el caso de uso (una sola zona horaria fija para toda la app).

## Próximo cambio
Ninguno previsto — a definir con el usuario.
