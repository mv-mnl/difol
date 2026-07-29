# Frontend — Sprint 0

## Cambio realizado
- Esqueleto React con Vite (`frontend/`), sin plantilla generada por CLI (escrito a mano porque `npm` no está disponible en el entorno local; las dependencias se instalan dentro del contenedor Docker).
- `App.jsx` hace un fetch a `GET /api/health` del backend (`VITE_API_URL`, por defecto `http://localhost:4000`) y muestra el estado, solo para verificar la conexión end-to-end.
- `Dockerfile` basado en `node:22-alpine`, corre `npm run dev -- --host` en el puerto `5173`.

## Próximo cambio (Sprint 2)
- Reemplazar la pantalla de verificación por el formulario de carga de movimientos (monto, tipo, categoría, lugar, fecha).
- Definir estructura de rutas/páginas (dashboard, carga, métricas, settings) según las 4 partes de la app.
