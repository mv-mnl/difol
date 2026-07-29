# Difol

App de control de gastos e ingresos. Cada movimiento tiene un tipo (ingreso o egreso), un lugar obligatorio (de/a donde sale o entra el dinero) y una categoria opcional (filtrada segun el tipo).

Stack: Docker, Node.js + Express (backend), React + Vite (frontend), MySQL (base de datos).

## Partes de la app

- **Dashboard**: balance total e ingresos/gastos del mes actual.
- **Cargar movimiento**: alta de movimientos y listado de los mas recientes.
- **Metricas**: gasto/ingreso por categoria y por lugar (mes actual), y evolucion anual.
- **Settings**: administracion de cuentas (lugares) y categorias.

## Correr en desarrollo

```
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- MySQL: puerto 3307 en el host (mapeado asi para no chocar con otro MySQL que ya estuviera corriendo en 3306; puede ajustarse en `docker-compose.yml`)

El backend y el frontend corren con recarga en caliente (`node --watch` y `vite --host`) usando bind mounts.

> Nota: con `node --watch` sobre el bind mount del backend, a veces una ruta recien agregada al codigo no queda registrada en el primer arranque (evento espurio de montaje). Si un endpoint nuevo responde 404 pese a que el codigo esta bien, correr `docker compose restart backend`.

## Correr en produccion

```
docker compose -f docker-compose.prod.yml up -d --build
```

Diferencias con el modo desarrollo:
- El frontend se compila con `vite build` y se sirve con nginx (puerto `8080` en vez de `5173`).
- El backend corre con `npm start` (sin `--watch`) y `NODE_ENV=production`.
- Sin bind mounts: las imagenes son inmutables, hay que reconstruir (`--build`) para aplicar cambios de codigo.
- El puerto de MySQL no se expone al host (solo accesible dentro de la red de Docker).
- `VITE_API_URL` se define en build-time (variable de entorno `VITE_API_URL` antes del `up`, default `http://localhost:4000`).

No correr `docker-compose.yml` y `docker-compose.prod.yml` al mismo tiempo: comparten el mismo volumen de MySQL por defecto (mismo nombre de proyecto).

## Documentacion

Cada cambio de sprint esta documentado en `documentacion/{general,backend,frontend,database}/`. El roadmap completo esta en `documentacion/general/roadmap-sprints.md`.
