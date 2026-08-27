# Roadmap de Sprints — Difol

App de control de gastos e ingresos. Stack: Docker, Node.js + Express (backend), React (frontend), MySQL (database).

## Estado actual
- **Sprint 0 — Setup del proyecto**: completado
- **Sprint 1 — Modelo de datos y API base**: completado
- **Sprint 2 — Carga de movimientos (frontend)**: completado
- **Sprint 3 — Dashboard (balance)**: completado
- **Sprint 4 — Métricas**: completado
- **Sprint 5 — Settings**: completado
- **Sprint 6 — Pulido y documentación**: completado
- **Sprint 7 — Métricas completas**: completado
- **Sprint 8 — Autenticación y multi-usuario**: completado

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

### Sprint 7 — Métricas completas
- Cubrir todas las métricas listadas en `metricas_movimientos.md` (flujo general, categoría, lugar, hábitos, comparativas temporales, calidad de datos, avanzadas), excepto presupuesto (requiere una feature nueva, fuera de alcance por ahora)
- Script de datos de prueba (24 meses de movimientos sintéticos) para poder ver las métricas con volumen realista

### Sprint 8 — Autenticación y multi-usuario
- Registro y login (email + contraseña, JWT)
- `lugares`, `categorias` y `movimientos` quedan scoped por usuario
- Sistema de migraciones para aplicar el cambio de esquema sin perder los datos ya existentes
- Los datos que ya existían en la base (de antes de este sprint) se asignan automáticamente al primer usuario que se registra
