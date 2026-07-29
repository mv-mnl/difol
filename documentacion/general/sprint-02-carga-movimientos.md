# Sprint 2 — Carga de movimientos (frontend)

## Cambio realizado
- Reemplazada la pantalla de verificación de salud del backend por la pantalla de carga de movimientos: formulario + listado de movimientos recientes.
- Verificación: se sirvieron todos los archivos nuevos vía Vite sin errores de build, y se repitió la secuencia exacta de llamadas que dispara la UI (`GET /api/lugares`, `GET /api/categorias?tipo=`, `POST /api/movimientos`, `GET /api/movimientos`) contra el backend real, con resultado correcto.
- **Limitación de verificación**: este entorno no tiene una herramienta de navegador real disponible, así que no se probó visualmente el formulario renderizado ni se tomó una captura de pantalla. Se recomienda una pasada manual en el navegador antes de considerar la UI completamente validada.

## Detalle
- Ver `documentacion/frontend/sprint-02-carga-movimientos.md`

## Próximo cambio (Sprint 3)
- Endpoint de balance (total, por período) en el backend.
- Vista de dashboard en el frontend con el balance actual e ingresos vs egresos.
- Con dos pantallas coexistiendo (dashboard + carga), es el punto natural para introducir navegación (tabs o rutas) en el frontend.
