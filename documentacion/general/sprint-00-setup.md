# Sprint 0 — Setup del proyecto

## Cambio realizado
- Creada la estructura base del proyecto: `backend/`, `frontend/`, `database/`, `documentacion/`.
- `docker-compose.yml` en la raíz con 3 servicios: `mysql`, `backend`, `frontend`.
- `.env.example` en la raíz para las credenciales de MySQL compartidas por los servicios.
- `.gitignore` en la raíz (`node_modules`, `dist`, `.env`, logs).
- Verificado con `docker compose up`: los 3 contenedores levantan correctamente, `GET /api/health` responde `{"status":"ok"}` y el frontend sirve la app de Vite.
- Se detectó conflicto de puerto 3306 (ya usado por otro contenedor `mysql_db` en el host) y se remapeó el servicio `mysql` a `3307:3306` en el host, sin afectar la conexión interna backend↔mysql (que sigue siendo por el puerto 3306 dentro de la red de Docker).

## Detalle por área
- Backend: ver `documentacion/backend/sprint-00-setup.md`
- Frontend: ver `documentacion/frontend/sprint-00-setup.md`
- Database: ver `documentacion/database/sprint-00-setup.md`

## Próximo cambio (Sprint 1)
- Definir esquema MySQL: `movimientos`, `categorias`, `lugares`.
- Migraciones/seed inicial en `database/`.
- Endpoints CRUD en el backend para categorías, lugares y movimientos.
- Validación: `lugar` obligatorio en cada movimiento, `categoria` opcional y filtrada según tipo (ingreso/egreso).
