# Backend — Sprint 8: Autenticación y multi-usuario

## Cambio realizado
- **`src/migrate.js`** (nuevo): runner de migraciones. Lee `database/migrations/*.sql` en orden, aplica las que no estén en la tabla `schema_migrations` (una por transacción), y se corre automáticamente antes de `app.listen()` en `src/index.js`. Si falla, el proceso aborta el arranque (`process.exit(1)`) en vez de levantar el servidor contra un esquema a medio migrar.
- **`src/auth.js`** (nuevo): `hashPassword`/`compararPassword` (bcryptjs, 10 rounds) y `firmarToken`/`verificarToken` (jsonwebtoken, `HS256`, 30 días de expiración). `JWT_SECRET` sale de `process.env`, con un fallback de desarrollo (loggea un warning si no está seteado).
- **`src/middleware/requireAuth.js`** (nuevo): lee `Authorization: Bearer <token>`, valida el JWT, confirma que el usuario todavía exista en la tabla `usuarios` y adjunta `req.usuarioId`. 401 si falta el header, el token es inválido/expiró, o el usuario ya no existe.
- **`src/routes/auth.routes.js`** (nuevo):
  - `POST /register` (`email`, `password` ≥ 8 chars, `nombre`): crea el usuario, y si es el **primer** usuario del sistema (`COUNT(*) FROM usuarios = 1` después del insert), reclama en la misma transacción todas las filas de `lugares`/`categorias`/`movimientos` con `usuario_id IS NULL`. Devuelve `{ token, usuario }`.
  - `POST /login` (`email`, `password`): devuelve `{ token, usuario }` o 401 genérico ("credenciales inválidas", sin distinguir si el email no existe o la contraseña es incorrecta).
  - `GET /me` (autenticado): devuelve el usuario actual — lo usa el frontend al cargar la app para validar el token guardado.
- **`src/index.js`**: monta `authRouter` en `/api/auth` (público) y aplica `requireAuth` a `/api/lugares`, `/api/categorias`, `/api/movimientos`, `/api/balance` y `/api/metricas`. Corre `ejecutarMigraciones()` antes de escuchar el puerto.
- **Todas las rutas de datos** (`lugares`, `categorias`, `movimientos`, `balance`, `metricas`) filtran por `usuario_id = req.usuarioId` en cada `SELECT`/`UPDATE`/`DELETE`, e insertan `usuario_id` en cada `INSERT`. En `movimientos.routes.js`, la validación de que `lugar_id`/`categoria_id` existan ahora también exige que pertenezcan al usuario autenticado (evita que un usuario referencie IDs de otro usuario aunque los adivine).
- `metricas.routes.js` fue el más afectado por tener 12 endpoints con queries ad-hoc: cada uno gana `usuario_id = ?` como primera condición del `WHERE` (o se agrega un `WHERE` donde antes no había, como en `/calidad`, que tenía 3 queries sin filtrar).
- **`scripts/seed-demo.js`**: ahora recibe el email de un usuario por argumento (`node scripts/seed-demo.js user@ejemplo.com`), resuelve su `usuario_id`, y tanto la lectura de categorías/lugares como el `DELETE`/`INSERT` de movimientos quedan scoped a ese usuario.

## Decisiones y supuestos
- El runner de migraciones separa comentarios `--` antes de hacer `split(";")` — un comentario con `;` adentro (ej. "eran únicos globalmente; con multi-usuario...") rompía el split ingenuo original. Ver `database/migrations/003_usuario_scoped_uniques.sql`.
- Las migraciones viven en `database/migrations/` (no en `backend/`) para mantener el esquema completo documentado junto a `init.sql`, pero el backend necesita leerlas en runtime — se agregó `./database:/app/database:ro` como volumen del servicio `backend` en ambos `docker-compose*.yml` (antes el contenedor de backend no tenía visibilidad de `database/` en absoluto).
- Verificado extremo a extremo contra el volumen real de MySQL del proyecto (con datos preexistentes: 3 lugares, 6 categorías, 4 movimientos) vía `curl`: migraciones idempotentes en restarts sucesivos, 401 sin token, registro del primer usuario reclama los datos huérfanos, un segundo usuario registrado ve listas vacías y no puede crear movimientos referenciando lugares/categorías del primer usuario, y los 12 endpoints de `/api/metricas` responden 200.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
