# Sprint 3 — Dashboard (balance)

## Cambio realizado
- Endpoint `GET /api/balance` en el backend, con filtros opcionales `desde`/`hasta`.
- Vista de Dashboard en el frontend: balance total (todo el historial) e ingresos/gastos del mes actual.
- Navegación simple por tabs (Dashboard / Cargar movimiento) en `App.jsx`, sin librería de routing — con dos pantallas alcanza con estado local; se reevaluará si hace falta URL routing cuando existan más pantallas con navegación profunda (settings, métricas).
- Verificado con `docker compose up` + `curl`: balance total, balance filtrado por rango de fechas y rango vacío (sin movimientos) devuelven los valores esperados.

## Incidente durante la verificación
- Tras levantar el backend con el nuevo router de balance, `GET /api/balance` devolvía 404 aunque el archivo en disco y el import en `index.js` eran correctos. Causa: un evento de arranque del bind mount disparó un "Restarting" de `node --watch` con el grafo de módulos a medio cargar. Se resolvió con `docker compose restart backend`. Si un endpoint nuevo no aparece después de levantar los contenedores, probar reiniciar el servicio antes de asumir un bug de código.

## Detalle por área
- Backend: ver `documentacion/backend/sprint-03-dashboard-balance.md`
- Frontend: ver `documentacion/frontend/sprint-03-dashboard-balance.md`

## Próximo cambio (Sprint 4)
- Endpoints de agregación para métricas (gasto por mes, por categoría, por lugar).
- Vista de métricas con gráficos, agregada como nueva tab de navegación.
