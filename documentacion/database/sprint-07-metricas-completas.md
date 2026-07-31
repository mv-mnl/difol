# Database — Sprint 7

## Cambio realizado
- Sin cambios de esquema — todas las métricas nuevas se resuelven con queries sobre las tablas existentes (`movimientos`, `categorias`, `lugares`), tal como se había anticipado en el Sprint 1.
- Se agregó `backend/scripts/seed-demo.js`: genera ~900 movimientos sintéticos (24 meses, hasta el mes en curso) usando las categorías y lugares que ya existen en la base (no se tocaron los nombres del seed de `init.sql`), y los inserta en lotes de 200 filas. Corre con `docker compose exec backend node scripts/seed-demo.js` y borra los movimientos existentes antes de insertar (pensado para un entorno de desarrollo/demo, no para producción).
- El generador simula patrones reales para que las métricas se vean con sentido: sueldo fijo el día 1, servicios (gasto fijo) en días tempranos del mes, comida/transporte frecuentes y pequeños (bastantes por debajo de $5, para poblar "gastos hormiga"), un leve incremento de precios mes a mes, un boost estacional en noviembre/diciembre, ~8-15% de movimientos sin categoría y ~30-50% sin descripción (para poblar las métricas de calidad de datos).

## Nota
- `seed-demo.js` depende de que `categorias`/`lugares` ya tengan las filas del seed de `init.sql` (Sueldo, Otros ingresos, Comida, Transporte, Servicios, Otros gastos / Efectivo, Banco) — si se corre contra una base con nombres distintos, falla explícitamente en vez de insertar datos inconsistentes.

## Próximo cambio
- Ninguno previsto.
