# Producción por túnel de Cloudflare

## Cambio realizado
`docker-compose.prod.yml` deja de publicar puertos al host — MySQL, backend y frontend son alcanzables únicamente a través de un [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (servicio `cloudflared` nuevo, `image: cloudflare/cloudflared:latest`, `tunnel run --token ${CLOUDFLARE_TUNNEL_TOKEN} --protocol http2`). El túnel se conecta hacia afuera desde el contenedor, así que no hace falta abrir ni reenviar ningún puerto en el firewall/router del servidor — mismo patrón que ya usaba el usuario en otro proyecto (`sicohs_cloudflared`).

- Un solo hostname público (configurado en el dashboard de Cloudflare Zero Trust, Networks → Tunnels → Public Hostname) apunta a `http://frontend:80`. Alcanza para toda la app porque `frontend/nginx.conf` ya proxea `/api/` al backend — no hace falta un segundo hostname ni exponer el backend por separado.
- El build del frontend no define `VITE_API_URL`, así que el bundle llama a rutas relativas (`/api/...`) que nginx resuelve contra `backend:4000` dentro de la red de Docker. Esto es lo que permite que un único hostname cubra frontend + API.
- `CLOUDFLARE_TUNNEL_TOKEN` es obligatorio (`${CLOUDFLARE_TUNNEL_TOKEN:?...}` en el compose) — el stack no arranca sin él, mismo patrón que ya existía para `JWT_SECRET`.

## Decisiones y supuestos
- Se asume que el túnel y el hostname público ya están creados en el dashboard de Cloudflare Zero Trust (el usuario confirmó que ya tenía uno de un proyecto anterior) — este cambio solo agrega el conector (`cloudflared`) al lado de Docker. Crear el túnel en sí requiere login interactivo en el navegador, fuera del alcance de lo que se puede hacer desde acá.
- Verificado con `docker compose -f docker-compose.prod.yml config` (con y sin `CLOUDFLARE_TUNNEL_TOKEN`) que el archivo es sintácticamente válido y que falla con un mensaje claro si falta el token. No se corrió el stack de producción completo en este entorno porque comparte nombre de proyecto/volumen de MySQL con el stack de desarrollo que ya estaba corriendo (mismo motivo documentado en el README: no correr ambos a la vez).

## Próximo cambio
Ninguno previsto — a definir con el usuario.
