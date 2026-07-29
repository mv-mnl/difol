# Backend — Sprint 0

## Cambio realizado
- Esqueleto Express en `backend/src/index.js`, escuchando en el puerto `4000` (configurable por `PORT`).
- Endpoint `GET /api/health` para verificación de vida del servicio.
- `backend/src/db.js`: pool de conexión a MySQL con `mysql2/promise`, usando variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Aún no se usa en ningún endpoint.
- `Dockerfile` basado en `node:22-alpine`, corre `npm run dev` (usa `node --watch` para recarga en desarrollo).
- `.env.example` con las variables esperadas.

## Próximo cambio (Sprint 1)
- Crear modelos/queries para `movimientos`, `categorias`, `lugares` usando el pool de `db.js`.
- Endpoints CRUD para las 3 entidades.
- Middleware de validación (lugar obligatorio, categoría opcional filtrada por tipo).
