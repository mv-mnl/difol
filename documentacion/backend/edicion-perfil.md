# Backend — Edición de perfil

## Cambio realizado
- `PUT /api/auth/me` (nuevo, en `src/routes/auth.routes.js`, requiere `requireAuth`): actualiza `nombre` y `email` del usuario autenticado. Ambos son obligatorios en el body (igual que el resto de los `PUT` de la app, ej. `lugares`/`categorias` — se reemplazan, no se hace merge parcial).
- Cambio de contraseña opcional dentro del mismo endpoint: si el body trae `password_nueva`, también exige `password_actual` y la valida contra el hash guardado (`compararPassword`) antes de aceptar el cambio — 401 si no coincide. `password_nueva` se valida con el mismo mínimo que en el registro (8 caracteres).
- Email duplicado devuelve 409 (mismo manejo de `ER_DUP_ENTRY` que en `/register`), ya que `usuarios.email` sigue siendo `UNIQUE`.
- Devuelve el usuario actualizado (`{ id, email, nombre }`, sin el hash) — mismo shape que `/register`, `/login` y `/me`.

## Decisiones y supuestos
- No se pide contraseña para cambiar nombre/email — consistente con la mayoría de apps chicas; si en algún momento se agrega verificación de email, ahí sí conviene reconsiderar (ej. re-verificar el email nuevo antes de aplicarlo).
- El JWT no lleva `email`/`nombre` en el payload (solo `id`, ver `src/auth.js`), así que cambiar estos datos no invalida el token existente ni requiere volver a loguearse.
- Probado con `curl` contra el backend real: actualizar nombre, cambiar contraseña con contraseña actual incorrecta (401), cambiar contraseña correctamente y confirmar que el login con la contraseña vieja pasa a fallar y con la nueva funciona.

## Próximo cambio
Ninguno previsto — a definir con el usuario.
