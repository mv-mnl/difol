# Frontend — Edición de perfil

## Cambio realizado
- `src/api.js`: agrega `actualizarPerfil(perfil)` → `PUT /api/auth/me`.
- `src/components/PerfilManager.jsx` (nuevo): formulario de nombre/email siempre visible, más un botón "Cambiar contraseña" que despliega los campos de contraseña actual/nueva/confirmar (la confirmación se valida en el cliente antes de enviar). Reusa las clases existentes (`.movimiento-form`, `.field`, `.form-error`, `.form-actions`) y agrega `.form-ok` (mensaje de éxito en verde) a `App.css`.
- `src/pages/Settings.jsx`: gana una sección "Perfil" arriba de "Cuentas"/"Categorias", que renderiza `PerfilManager`. Recibe `usuario` y `onUsuarioActualizado` como props.
- `src/App.jsx`: pasa `usuario` (el estado que ya se cargaba para el gate de autenticación) y `setUsuario` como `onUsuarioActualizado` a `<Settings>` — así, al guardar el perfil, el nombre en el header (`.app-user-bar`) se actualiza al instante sin recargar la página.

## Decisiones y supuestos
- No hay confirmación adicional (tipo "reescribí tu contraseña para confirmar") antes de guardar nombre/email — coincide con el resto de los formularios de Settings (`CuentasManager`/`CategoriasManager`), que tampoco la piden.
- Verificado con `vite build` (compila sin errores) y contra el backend real vía `curl` — no se verificó visualmente en un navegador (mismo límite de entorno de siempre, sin browser automation disponible).

## Próximo cambio
Ninguno previsto — a definir con el usuario.
