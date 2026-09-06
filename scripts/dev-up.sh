#!/usr/bin/env bash
# Levanta docker-compose eligiendo automaticamente un puerto libre para cada
# servicio si el puerto por defecto ya esta ocupado en el host. No modifica
# docker-compose.yml ni tu .env: solo exporta MYSQL_PORT/BACKEND_PORT/
# FRONTEND_PORT para este arranque y llama a `docker compose`.
#
# Uso: ./scripts/dev-up.sh [args de docker compose, ej: -d]
set -euo pipefail
cd "$(dirname "$0")/.."

# true si algo esta escuchando en 127.0.0.1:$1
port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && exec 3<&- 3>&- && return 0
  return 1
}

# imprime el primer puerto libre >= $1
find_free_port() {
  local port="$1"
  while port_in_use "$port"; do
    port=$((port + 1))
  done
  echo "$port"
}

pick() {
  local name="$1" default="$2"
  # si el usuario ya la definio en el entorno o en .env, se respeta tal cual
  if [ -n "${!name:-}" ]; then
    echo "${!name}"
    return
  fi
  local chosen
  chosen="$(find_free_port "$default")"
  if [ "$chosen" != "$default" ]; then
    echo "puerto $default ocupado, uso $chosen para $name" >&2
  fi
  echo "$chosen"
}

export MYSQL_PORT="$(pick MYSQL_PORT 3308)"
export BACKEND_PORT="$(pick BACKEND_PORT 4000)"
export FRONTEND_PORT="$(pick FRONTEND_PORT 5173)"

echo ""
echo "Frontend: http://localhost:${FRONTEND_PORT}"
echo "Backend:  http://localhost:${BACKEND_PORT}"
echo "MySQL:    localhost:${MYSQL_PORT}"
echo ""

docker compose up "$@"
