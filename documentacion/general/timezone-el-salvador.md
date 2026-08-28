# Zona horaria de El Salvador

## Cambio realizado
Los contenedores de `mysql` y `backend` ahora reciben la variable de entorno `TZ=America/El_Salvador` (UTC-6, sin horario de verano), tanto en `docker-compose.yml` (desarrollo) como en `docker-compose.prod.yml` (producción). Es configurable vía `${TZ:-America/El_Salvador}` — si se define `TZ` en el `.env` del host, ese valor gana; si no, cae al default de El Salvador.

- **MySQL**: la imagen oficial `mysql:8.4` respeta `TZ` para fijar la hora del contenedor, y `time_zone` del servidor queda en `SYSTEM` (default), o sea que `NOW()`, `CURRENT_TIMESTAMP` y la columna `movimientos.created_at` (`TIMESTAMP DEFAULT CURRENT_TIMESTAMP`) pasan a reportar hora de El Salvador en vez de UTC. Verificado en un contenedor de prueba: con `TZ=America/El_Salvador`, `NOW()` da la hora local mientras `UTC_TIMESTAMP()` sigue en UTC.
- **Backend**: Node respeta `process.env.TZ` para todo lo que use `Date` (confirmado en `node:22-alpine`, que trae la tzdata de ICU embebida, no depende del paquete `tzdata` del sistema operativo). Esto importa porque `backend/src/routes/metricas.routes.js` usa `new Date()` para calcular "mes actual"/"hoy" en varios endpoints — sin este cambio, esos cálculos usaban UTC y podían mostrar el mes/día equivocado durante las ~6 horas de diferencia con El Salvador (por ejemplo, a las 19:00 hora local ya es el día siguiente en UTC).
- El driver `mysql2` (usado en `backend/src/db.js`) usa por default la zona horaria local del proceso Node (`timezone: 'local'`) para convertir `DATE`/`DATETIME`/`TIMESTAMP` — al quedar Node y MySQL en la misma zona, no hizo falta tocar la config del pool.
- Se documentó la variable en `backend/.env.example` y en el `.env.example` de la raíz.

## Decisiones y supuestos
- Se fijó el valor a `America/El_Salvador` (no hay horario de verano en El Salvador, así que el offset es siempre UTC-6) en vez de un offset fijo como `-06:00`, para que quede explícito y a prueba de cambios de política horaria.
- No se tocó el contenedor `frontend`: el navegador del usuario ya usa su propia hora local (`frontend/src/utils/fechas.js` usa `new Date()` del lado del cliente), y no hay formateo con `Intl`/`toLocaleDateString` que dependa de la zona horaria del servidor.
- Verificado con `docker compose -f docker-compose.yml config` y `docker compose -f docker-compose.prod.yml config` (con las variables obligatorias seteadas) que ambos archivos siguen siendo válidos.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
