# Edición de perfil

## Cambio realizado
Se agregó edición de perfil a la sección "Settings": cada usuario puede cambiar su nombre, su email y su contraseña desde la app (antes solo existían registro y login, sin forma de modificar esos datos después). Cierra el pendiente que había quedado anotado en `documentacion/general/sprint-08-autenticacion.md` ("no hay endpoint para cambiar contraseña").

- Nombre y email se editan libremente (sin pedir contraseña).
- Cambiar la contraseña requiere la contraseña actual — separado como una sección "Cambiar contraseña" que se despliega aparte dentro del mismo formulario, para no pedirla en cada guardado de nombre/email.

## Detalle
- Backend: ver `documentacion/backend/edicion-perfil.md`
- Frontend: ver `documentacion/frontend/edicion-perfil.md`

## Próximo cambio
Ninguno previsto — a definir con el usuario.
