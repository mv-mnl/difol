# Frontend — Sprint 3

## Cambio realizado
- `src/api.js`: agregado `getBalance({ desde, hasta })`.
- `src/pages/Dashboard.jsx`: pide balance total y balance del mes actual en paralelo (`Promise.all`), muestra balance total como cifra grande y una fila con ingresos/gastos del mes.
- `src/pages/CargarMovimiento.jsx`: se movió acá el contenido que antes vivía directo en `App.jsx` (formulario + listado), sin cambios de lógica.
- `src/App.jsx`: pasó a ser un shell con navegación por tabs (`Dashboard` / `Cargar movimiento`) usando `useState`, sin agregar `react-router` — con dos pantallas no hace falta.
- `src/App.css`: estilos de tabs y de las cards del dashboard (balance total, ingresos/gastos del mes).

## Próximo cambio (Sprint 4)
- Nueva tab de "Métricas" con gráficos, reutilizando el patrón de páginas en `src/pages/`.
- Si la navegación crece (por ejemplo, Settings con sub-secciones), evaluar introducir `react-router` en ese punto.
