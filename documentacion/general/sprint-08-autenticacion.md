# General — Sprint 8: Autenticación y multi-usuario

## Cambio realizado
Difol pasa de ser una app de un solo usuario a soportar múltiples cuentas, cada una con sus propios lugares, categorías y movimientos.

- **Registro y login** con email + contraseña (hash bcrypt) y sesión vía JWT (`Authorization: Bearer <token>`, guardado en `localStorage` en el frontend, expira a los 30 días).
- **Todo el modelo de datos quedó scoped por usuario**: `lugares`, `categorias` y `movimientos` ahora tienen `usuario_id`. Todos los endpoints (excepto `/api/health` y `/api/auth/*`) requieren estar autenticado y sólo devuelven/afectan datos del usuario autenticado.
- **Migración de datos existentes**: la base ya tenía datos reales (de antes de que existiera el login). En vez de asignarlos a un usuario "admin" hardcodeado, quedan con `usuario_id NULL` hasta que **el primer usuario que se registra en el sistema los reclama automáticamente** (ver `backend/src/routes/auth.routes.js`). Esto aplica igual en desarrollo y en producción — el primer `POST /api/auth/register` que se ejecute contra una base con datos huérfanos se los queda.
- **Sistema de migraciones nuevo** (`database/migrations/`, corridas por `backend/src/migrate.js` al arrancar el backend): resuelve un pendiente que quedó abierto desde el Sprint 1 (`init.sql` sólo corre en la primera inicialización del volumen de MySQL, así que no había forma de aplicar cambios de esquema sin perder datos). Cada archivo se aplica una sola vez, dentro de una transacción, y queda registrado en la tabla `schema_migrations`.

## Decisiones y supuestos
- **Token en `localStorage` + header `Authorization`, no cookies**: el CORS actual (`app.use(cors())`, sin `credentials`) y el hecho de que backend y frontend corren en orígenes distintos (puertos separados en dev, dominios distintos en un deploy típico sin proxy inverso compartido) hacían que cookies cross-origin requirieran HTTPS + `SameSite=None` + reconfigurar CORS. Bearer token es más simple para el tamaño de este proyecto; el costo es exposición a XSS si el frontend llegara a tener una vulnerabilidad de inyección de scripts (no la tiene hoy).
- **`usuario_id` queda `NULL`-able a nivel de esquema** en `lugares`/`categorias`/`movimientos`, aunque a nivel de aplicación nunca se inserta una fila nueva sin él. La alternativa (`NOT NULL` desde el inicio) no es posible sin antes poblar los datos existentes, y forzar un valor por defecto (ej. un usuario "sistema") habría contradicho el pedido explícito de "se asignarán al primer usuario".
- **Nombres de lugares/categorías dejan de ser únicos globalmente** y pasan a ser únicos por usuario (`UNIQUE(usuario_id, nombre)` / `UNIQUE(usuario_id, nombre, tipo)`) — dos usuarios distintos pueden tener ambos un lugar "Efectivo".
- El script `backend/scripts/seed-demo.js` (datos sintéticos de prueba) ahora requiere el email de un usuario como argumento (`node scripts/seed-demo.js user@ejemplo.com`), ya que categorías y lugares están scoped.

## Cambios pendientes fuera de alcance
- No hay endpoint para cambiar contraseña ni recuperarla (olvidé mi contraseña). Si se retoma, la parte de "Settings" del concepto original (`CLAUDE.md`) es el lugar natural para esto.
- No hay verificación de email ni rate limiting en `/api/auth/login` (fuerza bruta). Aceptable para el tamaño/uso actual de la app, pero a revisar si se expone públicamente.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
