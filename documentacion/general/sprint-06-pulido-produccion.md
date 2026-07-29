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

## Pendientes / mejoras futuras (fuera de alcance de este roadmap)
- No hay autenticación ni multi-usuario — la app asume un único usuario/cuenta, consistente con lo descrito en `CLAUDE.md`.
- El quirk de `node --watch` sobre bind mounts en dev es conocido pero no se investigó su causa raíz a fondo (no afecta producción, que no usa `--watch`).
- No se agregaron tests automatizados (unitarios/integración) — toda la verificación de este roadmap fue manual vía `curl` y (cuando fue posible) en el navegador.
