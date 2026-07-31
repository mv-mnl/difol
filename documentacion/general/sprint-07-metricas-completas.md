# Sprint 7 — Métricas completas

## Cambio realizado
- Se llevó la sección de Métricas de "por categoría/lugar + evolución anual" (Sprint 4) a cubrir todas las métricas de `metricas_movimientos.md`, organizadas en las mismas secciones del documento:
  1. **Flujo general**: resumen del mes (ingresos, egresos, balance, tasa de ahorro), proyección de gasto del mes según el ritmo actual, y balance acumulado de los últimos 24 meses.
  2. **Por categoría**: breakdown existente + evolución mensual de una categoría específica (selector) + categoría con mayor variación mes a mes + % de movimientos sin categoría.
  3. **Por lugar**: breakdown existente + matriz (heatmap) lugar × categoría + % de gasto en efectivo vs cuentas + cuenta más usada.
  4. **Comportamiento y hábitos**: promedio, mediana, máximo, mínimo, frecuencia semanal, racha máxima sin movimientos, gastos "hormiga" (bajo un umbral), distribución por día de la semana y por día del mes.
  5. **Comparativas temporales**: mes vs. mes anterior, mes vs. mismo mes año anterior, promedio móvil de 3 meses, estacionalidad (promedio por mes calendario).
  6. **Presupuesto**: **fuera de alcance** — requiere una feature nueva (tabla de límites por categoría + UI en Settings), no solo una métrica sobre datos existentes. Decisión tomada con el usuario.
  7. **Calidad de datos**: % con descripción, % sin categoría, lugar/categoría menos usados.
  8. **Avanzadas**: ratio gasto fijo vs. variable (clasificación heurística por nombre de categoría, no hay campo en el esquema), diversificación de categorías usadas por mes, detección de anomalías (categoría muy por encima de su promedio histórico), correlación entre ingreso y gasto mensual.
- Se inyectaron ~900 movimientos sintéticos (24 meses) para poder ver todas las métricas con datos realistas — ver detalle en `documentacion/database/sprint-07-metricas-completas.md`.
- Verificado en el navegador (Playwright headless, sin `chromium-cli` disponible en este entorno) con la app corriendo vía `docker compose up`: las 8 secciones cargan sin errores de consola, tanto para el toggle de Gastos como el de Ingresos.

## Detalle por área
- Backend: ver `documentacion/backend/sprint-07-metricas-completas.md`
- Frontend: ver `documentacion/frontend/sprint-07-metricas-completas.md`
- Database/seed: ver `documentacion/database/sprint-07-metricas-completas.md`

## Decisiones y supuestos
- **Ratio fijo/variable**: sin un campo `es_fijo` en `categorias`, se clasifica por palabras clave en el nombre (servicio, renta, internet, seguro, etc.). Es una heurística, no una fuente de verdad — si se quiere que sea confiable habría que agregar el campo al esquema.
- **% efectivo vs cuentas**: se asume que el lugar llamado exactamente "Efectivo" es el único efectivo; el resto cuenta como cuenta bancaria.
- **Saldo estimado por cuenta**: no se implementó — el esquema no tiene un saldo inicial por lugar, así que un "saldo acumulado por cuenta" partiría de una base arbitraria (0) y sería engañoso. Se dejó fuera hasta que exista ese dato.

## Próximo cambio
- Si se decide implementar Presupuesto: tabla `presupuestos(categoria_id, monto_limite, mes)` + UI en Settings + 3 métricas de la sección 6 del md.
