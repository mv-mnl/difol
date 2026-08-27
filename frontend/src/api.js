const API_URL = import.meta.env.VITE_API_URL || "";

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

export function getMovimientos({ tipo, desde, hasta, categoria_id, lugar_id } = {}) {
  return fetch(
    `${API_URL}/api/movimientos${buildQuery({ tipo, desde, hasta, categoria_id, lugar_id })}`
  ).then(handle);
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

export function getMetricasResumen({ desde, hasta } = {}) {
  return fetch(`${API_URL}/api/metricas/resumen${buildQuery({ desde, hasta })}`).then(handle);
}

export function getMetricasSerieMensual(meses) {
  return fetch(`${API_URL}/api/metricas/serie-mensual${buildQuery({ meses })}`).then(handle);
}

export function getMetricasProyeccionMes() {
  return fetch(`${API_URL}/api/metricas/proyeccion-mes`).then(handle);
}

export function getMetricasCategoriaEvolucion({ tipo, meses }) {
  return fetch(
    `${API_URL}/api/metricas/categoria-evolucion${buildQuery({ tipo, meses })}`
  ).then(handle);
}

export function getMetricasLugarCategoria({ tipo, desde, hasta } = {}) {
  return fetch(
    `${API_URL}/api/metricas/lugar-categoria${buildQuery({ tipo, desde, hasta })}`
  ).then(handle);
}

export function getMetricasHabitos({ tipo, desde, hasta, umbralHormiga }) {
  return fetch(
    `${API_URL}/api/metricas/habitos${buildQuery({ tipo, desde, hasta, umbralHormiga })}`
  ).then(handle);
}

export function getMetricasCalidad() {
  return fetch(`${API_URL}/api/metricas/calidad`).then(handle);
}

export function getMetricasAvanzadas(meses) {
  return fetch(`${API_URL}/api/metricas/avanzadas${buildQuery({ meses })}`).then(handle);
}

export function crearMovimiento(movimiento) {
  return sendJson(`${API_URL}/api/movimientos`, "POST", movimiento);
}

export function actualizarMovimiento(id, movimiento) {
  return sendJson(`${API_URL}/api/movimientos/${id}`, "PUT", movimiento);
}

export function eliminarMovimiento(id) {
  return fetch(`${API_URL}/api/movimientos/${id}`, { method: "DELETE" }).then(handle);
}
