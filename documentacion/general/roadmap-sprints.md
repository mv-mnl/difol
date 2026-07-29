# Roadmap de Sprints — Difol

App de control de gastos e ingresos. Stack: Docker, Node.js + Express (backend), React (frontend), MySQL (database).

## Estado actual
- **Sprint 0 — Setup del proyecto**: completado
- **Sprint 1 — Modelo de datos y API base**: completado

## Sprints

### Sprint 0 — Setup del proyecto
- Estructura de carpetas: `backend/`, `frontend/`, `database/`, `documentacion/`
- `docker-compose.yml` con servicios: node (Express), react, mysql
- Backend: esqueleto Express + conexión a MySQL
- Frontend: esqueleto React (Vite)
- Primer commit con esto funcionando (`docker-compose up` levanta los 3 servicios)

### Sprint 1 — Modelo de datos y API base
- Esquema MySQL: `movimientos`, `categorias` (tipo ingreso/egreso), `lugares`
- Migraciones/seed inicial
- Endpoints CRUD: categorías, lugares, movimientos
- Validación: `lugar` obligatorio, `categoria` opcional y filtrada por tipo (ingreso/egreso)

### Sprint 2 — Carga de movimientos (frontend)
- Formulario de ingreso de movimiento (monto, tipo, categoría, lugar, fecha)
- Conexión al API, listado simple de movimientos recientes
- Pantalla enfocada únicamente en cargar datos

### Sprint 3 — Dashboard (balance)
- Endpoint de balance (total, por período)
- Vista de dashboard: balance actual, ingresos vs egresos

### Sprint 4 — Métricas
- Endpoints de agregación (gasto por mes, por categoría, por lugar)
- Vista de métricas con gráficos

### Sprint 5 — Settings
- CRUD de categorías y cuenta desde la UI
- Configuración general de la app

### Sprint 6 — Pulido y documentación
- Revisar que `documentacion/{general,backend,frontend,database}` esté al día
- Manejo de errores, validaciones finales, ajustes de UX
- Preparar deploy con Docker en modo producción
