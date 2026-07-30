# Sprint 6 — Pulido y documentación

## Cambio realizado
- **Validación de fechas**: nuevo `backend/src/validation.js` (`esFechaValida`, `validarRangoFechas`), aplicado en `balance.routes.js`, `movimientos.routes.js` (query params y creación/edición) y `metricas.routes.js` (por-categoria, por-lugar). Fechas mal formadas o rangos invertidos (`desde` > `hasta`) ahora devuelven 400 con mensaje claro en vez de un 500 genérico causado por un error de MySQL.
- **Deploy de producción**: `backend/Dockerfile.prod` (`npm start` sin `--watch`, `NODE_ENV=production`), `frontend/Dockerfile.prod` (build multi-stage: `vite build` + `nginx` sirviendo estático) con `frontend/nginx.conf`, y `docker-compose.prod.yml` en la raíz. Sin bind mounts (imágenes inmutables) y sin exponer el puerto de MySQL al host.
- **README.md**: se llenó con descripción del proyecto, cómo correr en desarrollo y en producción, y referencia a la documentación de sprints.
- Verificado con `docker compose up` (dev): validaciones nuevas responden 400 en los casos esperados (fecha con formato inválido, mes fuera de rango 1-12, rango invertido) y el flujo normal sigue funcionando.
- Verificado con `docker compose -f docker-compose.prod.yml up -d --build`: build de producción exitoso, backend corriendo con `npm start`, frontend servido por nginx en el puerto 8080, y confirmado que `VITE_API_URL` quedó embebido correctamente en el bundle de producción.
- Otra vez el quirk de `node --watch` (ver Sprint 3) al levantar el backend en modo dev tras editar rutas — resuelto con `docker compose restart backend`, ya bien conocido a esta altura.

## Detalle
- Backend: ver `documentacion/backend/sprint-06-pulido-produccion.md`

## Estado del roadmap
Los 6 sprints planeados están completos. Las 4 partes de la app (Dashboard, Cargar movimiento, Metricas, Settings) están implementadas y verificadas end-to-end, en modo desarrollo y producción.

## Correccion posterior: colision de nombres de imagen dev/prod
Se detecto que `docker-compose.yml` (dev) y `docker-compose.prod.yml` generaban imagenes con el mismo nombre por defecto (`difol-backend`, `difol-frontend`), porque Docker Compose deriva el nombre del directorio del proyecto, no del archivo compose usado. Consecuencia real: despues de levantar produccion una vez, un `docker compose up -d` (dev) sin `--build` reutilizaba en silencio las imagenes de produccion (nginx sirviendo el build estatico, backend con `npm start` sin watch) en vez de reconstruir el entorno de desarrollo — sin ningun error visible.

Arreglado agregando `image: difol-backend-prod` / `image: difol-frontend-prod` explicitos en `docker-compose.prod.yml`, para que dev y produccion nunca compartan tag de imagen. Si se alterna seguido entre ambos modos, conviene `docker compose up -d --build` la primera vez despues de haber levantado el otro modo, para evitar arrastrar una imagen vieja con un nombre de imagen no aislado (esto ya no deberia pasar con la separacion de nombres, pero es buena practica).

## Correccion posterior: healthcheck de mysql insuficiente bajo carga de disco del host
Se detecto que `docker compose -f docker-compose.prod.yml up` fallaba con `dependency failed to start: container difol-mysql-1 is unhealthy`, deteniendo a `backend` y `frontend` (ambos dependen de `mysql: condition: service_healthy`). Investigando el contenedor de mysql, no habia ningun error real: `mysqld --initialize-insecure` seguia vivo y avanzando, solo que muy lento (mas de 2 minutos para lo que normalmente tarda unos segundos), porque el disco del host (`md0`, el RAID donde vive `docker-data`) estaba saturado por otros servicios corriendo en el mismo servidor (syncthing, deemix, cloudflared, etc.) — `iostat` mostraba `%util` cercano a 100% y latencias de escritura de varios segundos.

El healthcheck original (`interval: 5s`, `retries: 10`, sin `start_period`) le daba a mysql apenas 50s antes de marcarlo `unhealthy`, insuficiente para este servidor cuando el disco esta bajo presion. Se ajusto tanto en `docker-compose.yml` como en `docker-compose.prod.yml`: `retries: 60` y se agrego `start_period: 60s`, dando a mysql varios minutos de margen antes de que Docker Compose se rinda, sin afectar la deteccion de fallas reales (el intervalo de chequeo sigue en 5s una vez pasado el `start_period`).

## Correccion posterior: URL del backend hardcodeada en el bundle rompia el acceso segun la red usada
Se detecto que la app mostraba datos distintos (o ninguno) segun si se accedia por la IP de Tailscale o por la IP local de la LAN. Causa: `VITE_API_URL` se resolvia en build time (Vite reemplaza `import.meta.env.VITE_*` en el JS estatico generado) y en `.env` estaba fijada a la IP de Tailscale del host (`http://100.75.20.68:4000`) para que fuera alcanzable "desde cualquier dispositivo de la tailnet". El bundle quedaba con esa IP grabada sin importar por donde se cargara la pagina, asi que cualquier dispositivo sin ruta a esa IP (por ejemplo, en la LAN local pero fuera de la tailnet) fallaba el fetch silenciosamente y mostraba la lista de movimientos vacia. El backend nunca filtro nada por IP — no hay ninguna logica de ese tipo en el codigo.

Arreglado eliminando la dependencia de una URL absoluta:
- `frontend/src/api.js`: `API_URL` ahora cae a `""` (relativo) en vez de a `http://localhost:4000`, asi que todos los fetch pegan a rutas relativas (`/api/movimientos`, etc.) en el mismo origen desde el que se cargo la SPA.
- `frontend/nginx.conf` (produccion): nueva `location /api/` que hace `proxy_pass http://backend:4000` dentro de la red interna de Docker.
- `frontend/vite.config.js` (desarrollo): `server.proxy` para `/api` apuntando a `http://backend:4000`, mismo comportamiento que nginx pero via el dev server de Vite.
- Se quito `VITE_API_URL` de `docker-compose.yml`, `docker-compose.prod.yml`, `frontend/Dockerfile.prod`, `.env` y `.env.example` — ya no hace falta fijar ninguna IP a mano.

Con esto el navegador siempre llama a `/api/...` en el mismo host:puerto por el que se accedio a la app (Tailscale, LAN o `localhost`), sin importar la red del dispositivo cliente. Verificado en produccion con `docker compose -f docker-compose.prod.yml up -d --build frontend backend`: `curl http://localhost:8080/api/movimientos` (puerto del frontend, no el 4000 del backend) devuelve los datos reales a traves del proxy, y el bundle generado ya no contiene ninguna IP hardcodeada (`grep` sobre `/usr/share/nginx/html/assets/` sin coincidencias).

## Pendientes / mejoras futuras (fuera de alcance de este roadmap)
- No hay autenticación ni multi-usuario — la app asume un único usuario/cuenta, consistente con lo descrito en `CLAUDE.md`.
- El quirk de `node --watch` sobre bind mounts en dev es conocido pero no se investigó su causa raíz a fondo (no afecta producción, que no usa `--watch`).
- No se agregaron tests automatizados (unitarios/integración) — toda la verificación de este roadmap fue manual vía `curl` y (cuando fue posible) en el navegador.
