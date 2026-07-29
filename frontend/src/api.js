const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function sendJson(url, method, body) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(handle);
}

export function getLugares() {
  return fetch(`${API_URL}/api/lugares`).then(handle);
}

export function crearLugar(nombre) {
  return sendJson(`${API_URL}/api/lugares`, "POST", { nombre });
}

export function actualizarLugar(id, nombre) {
  return sendJson(`${API_URL}/api/lugares/${id}`, "PUT", { nombre });
}

export function eliminarLugar(id) {
  return fetch(`${API_URL}/api/lugares/${id}`, { method: "DELETE" }).then(handle);
}

export function getCategorias(tipo) {
  const qs = tipo ? `?tipo=${tipo}` : "";
  return fetch(`${API_URL}/api/categorias${qs}`).then(handle);
}

export function crearCategoria(categoria) {
  return sendJson(`${API_URL}/api/categorias`, "POST", categoria);
}

export function actualizarCategoria(id, categoria) {
  return sendJson(`${API_URL}/api/categorias/${id}`, "PUT", categoria);
}

export function eliminarCategoria(id) {
  return fetch(`${API_URL}/api/categorias/${id}`, { method: "DELETE" }).then(handle);
}

export function getMovimientos() {
  return fetch(`${API_URL}/api/movimientos`).then(handle);
}

export function getBalance({ desde, hasta } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetch(`${API_URL}/api/balance${qs}`).then(handle);
}

function buildQuery(params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return qs ? `?${qs}` : "";
}

export function getMetricasPorCategoria({ tipo, desde, hasta }) {
  return fetch(
    `${API_URL}/api/metricas/por-categoria${buildQuery({ tipo, desde, hasta })}`
  ).then(handle);
}

export function getMetricasPorLugar({ tipo, desde, hasta } = {}) {
  return fetch(
    `${API_URL}/api/metricas/por-lugar${buildQuery({ tipo, desde, hasta })}`
  ).then(handle);
}

export function getMetricasPorMes(anio) {
  return fetch(`${API_URL}/api/metricas/por-mes${buildQuery({ anio })}`).then(handle);
}

export function crearMovimiento(movimiento) {
  return sendJson(`${API_URL}/api/movimientos`, "POST", movimiento);
}
