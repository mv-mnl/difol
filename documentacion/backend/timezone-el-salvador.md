# Zona horaria de El Salvador (backend)

## Cambio realizado
El servicio `backend` en `docker-compose.yml` y `docker-compose.prod.yml` ahora recibe `TZ: ${TZ:-America/El_Salvador}`. No se tocó código de la app (`db.js`, `metricas.routes.js`, etc.) porque Node toma la zona horaria del proceso desde `process.env.TZ` automáticamente, y el driver `mysql2` (`timezone: 'local'` por default) sigue esa misma zona al convertir columnas `DATE`/`DATETIME`/`TIMESTAMP`.

Esto corrige que `new Date()` en `backend/src/routes/metricas.routes.js` (usado para "mes actual"/"hoy" en varios endpoints de métricas) reflejaba UTC en vez de la hora de El Salvador (UTC-6, sin horario de verano).

## Decisiones y supuestos
- Confirmado en un contenedor `node:22-alpine` de prueba que `TZ=America/El_Salvador` cambia `new Date()` y `Intl.DateTimeFormat().resolvedOptions().timeZone` sin instalar el paquete `tzdata` (Node trae ICU con su propia base de datos de zonas horarias).
- Se documentó `TZ` en `backend/.env.example`.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
