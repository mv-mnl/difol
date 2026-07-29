const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getLugares() {
  return fetch(`${API_URL}/api/lugares`).then(handle);
}

export function getCategorias(tipo) {
  const qs = tipo ? `?tipo=${tipo}` : "";
  return fetch(`${API_URL}/api/categorias${qs}`).then(handle);
}

export function getMovimientos() {
  return fetch(`${API_URL}/api/movimientos`).then(handle);
}

export function crearMovimiento(movimiento) {
  return fetch(`${API_URL}/api/movimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movimiento),
  }).then(handle);
}
