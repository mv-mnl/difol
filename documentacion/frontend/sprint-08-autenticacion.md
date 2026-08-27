# Frontend — Sprint 8: Autenticación y multi-usuario

## Cambio realizado
- **`src/api.js`**: agrega `getToken`/`setToken`/`clearToken` (wrapper sobre `localStorage`, clave `difol_token`) y `registrar`/`login`/`getUsuarioActual`. Todas las llamadas al API ahora pasan por un `apiFetch` interno que agrega el header `Authorization: Bearer <token>` cuando hay uno guardado (antes cada función llamaba a `fetch` directo). Si una respuesta da 401, `handle()` limpia el token y recarga la página — vuelve a la pantalla de login sin que cada pantalla tenga que manejar el caso de sesión expirada por separado.
- **`src/pages/Auth.jsx`** (nuevo): formulario único con toggle entre "Iniciar sesión" y "Crear cuenta" (el registro pide `nombre` además de `email`/`password`). Reusa las clases `.movimiento-form`/`.field`/`.form-error`/`.form-actions` ya existentes para no introducir un sistema de estilos paralelo.
- **`src/App.jsx`**: al montar, si hay un token guardado intenta `getUsuarioActual()`; si falla (token inválido/expirado) lo limpia. Mientras se resuelve esa llamada no se renderiza nada (evita un parpadeo mostrando la pantalla de login antes de confirmar la sesión). Sin usuario autenticado, se muestra `<Auth />` en vez del layout con tabs. Con sesión activa, el header ahora tiene una fila superior con el nombre del usuario y un botón "Cerrar sesión" (`clearToken` + reset del estado local, sin recargar).
- **`App.css`**: estilos nuevos para `.app-header-top`, `.app-user-bar`, `.auth-screen`, `.auth-form`, `.auth-switch` — consistentes con la paleta y tipografía ya usadas en el resto de la app.

## Decisiones y supuestos
- Sesión manejada con estado simple en `App.jsx` (no se agregó un Context ni una librería de estado global) — la profundidad del árbol de componentes no lo justifica todavía; si en algún momento páginas internas necesitan saber quién es el usuario actual, ahí sí conviene subir esto a contexto.
- No hay pantalla de "olvidé mi contraseña" ni edición de perfil — no se pidió y no hay endpoint de backend para eso todavía (ver documentación de backend).
- Verificado con `vite build` (compila sin errores) y contra el backend real vía `curl` (no se verificó visualmente en un navegador — mismo límite de entorno que sprints anteriores, sin herramienta de browser automation disponible).

## Próximo cambio
Ninguno previsto — a definir con el usuario.
