# Difol

App de control de gastos e ingresos. Cada movimiento tiene un tipo (ingreso o egreso), un lugar obligatorio (de/a donde sale o entra el dinero) y una categoria opcional (filtrada segun el tipo).

Stack: Docker, Node.js + Express (backend), React + Vite (frontend), MySQL (base de datos).

## Partes de la app

- **Login / registro**: cada usuario tiene su propia cuenta (email + contrasena); sus lugares, categorias y movimientos son privados.
- **Dashboard**: balance total e ingresos/gastos del mes actual.
- **Cargar movimiento**: alta de movimientos y listado de los mas recientes.
- **Metricas**: gasto/ingreso por categoria y por lugar (mes actual), y evolucion anual.
- **Settings**: administracion de cuentas (lugares) y categorias.

## Autenticacion

El login es requerido: todos los endpoints salvo `/api/health` y `/api/auth/*` esperan un JWT (`Authorization: Bearer <token>`), que el frontend guarda en `localStorage` tras iniciar sesion. `POST /api/auth/register` crea la cuenta; si es la primera cuenta que se registra en el sistema, se queda automaticamente con cualquier dato preexistente en la base (lugares/categorias/movimientos cargados antes de que existiera el login).

Definir `JWT_SECRET` en el `.env` (ver `.env.example`) — en produccion es obligatorio, el `docker-compose.prod.yml` no arranca sin el.

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
cp .env.example .env   # completar JWT_SECRET y CLOUDFLARE_TUNNEL_TOKEN
docker compose -f docker-compose.prod.yml up -d --build
```

Diferencias con el modo desarrollo:
- El frontend se compila con `vite build` y se sirve con nginx (que ademas proxea `/api/` al backend — ver `frontend/nginx.conf`).
- El backend corre con `npm start` (sin `--watch`) y `NODE_ENV=production`.
- Sin bind mounts: las imagenes son inmutables, hay que reconstruir (`--build`) para aplicar cambios de codigo.
- **Sin puertos publicados al host** (ni MySQL, ni backend, ni frontend): todo el trafico entra por un tunel de Cloudflare (servicio `cloudflared`), que se conecta hacia afuera y no requiere abrir nada en el firewall/router. El hostname publico se configura en el dashboard de Cloudflare Zero Trust (Networks → Tunnels → tu tunel → Public Hostname) apuntando a `http://frontend:80`; como nginx ya proxea `/api/`, ese unico hostname cubre frontend y API. El conector necesita `CLOUDFLARE_TUNNEL_TOKEN` en `.env` (Zero Trust → tu tunel → "Install and run a connector"); sin esa variable el stack no arranca.
- No se define `VITE_API_URL` en el build — el frontend llama a rutas relativas (`/api/...`), que nginx resuelve contra el backend en la misma red de Docker. Esto es lo que hace que un solo hostname de Cloudflare alcance para todo; si en algun momento el frontend necesitara pegarle a un backend en otro host, ahi si hace falta pasarla como build arg.

No correr `docker-compose.yml` y `docker-compose.prod.yml` al mismo tiempo: comparten el mismo volumen de MySQL por defecto (mismo nombre de proyecto).

## Documentacion

Cada cambio de sprint esta documentado en `documentacion/{general,backend,frontend,database}/`. El roadmap completo esta en `documentacion/general/roadmap-sprints.md`.
