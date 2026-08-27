const API_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "difol_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // token invalido/expirado: mandar de vuelta a la pantalla de login.
      clearToken();
      window.location.reload();
    }
    throw new Error(body.error || `error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Todas las llamadas al API pasan por aca para que el token vaya siempre
// que exista (las rutas publicas de /api/auth simplemente lo ignoran).
function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  }).then(handle);
}

function sendJson(url, method, body) {
  return apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function registrar({ email, password, nombre }) {
  return sendJson(`${API_URL}/api/auth/register`, "POST", { email, password, nombre });
}

export function login({ email, password }) {
  return sendJson(`${API_URL}/api/auth/login`, "POST", { email, password });
}

export function getUsuarioActual() {
  return apiFetch(`${API_URL}/api/auth/me`);
}

export function actualizarPerfil(perfil) {
  return sendJson(`${API_URL}/api/auth/me`, "PUT", perfil);
}

export function getLugares() {
  return apiFetch(`${API_URL}/api/lugares`);
}

export function crearLugar(nombre) {
  return sendJson(`${API_URL}/api/lugares`, "POST", { nombre });
}

export function actualizarLugar(id, nombre) {
  return sendJson(`${API_URL}/api/lugares/${id}`, "PUT", { nombre });
}

export function eliminarLugar(id) {
  return apiFetch(`${API_URL}/api/lugares/${id}`, { method: "DELETE" });
}

export function getCategorias(tipo) {
  const qs = tipo ? `?tipo=${tipo}` : "";
  return apiFetch(`${API_URL}/api/categorias${qs}`);
}

export function crearCategoria(categoria) {
  return sendJson(`${API_URL}/api/categorias`, "POST", categoria);
}

export function actualizarCategoria(id, categoria) {
  return sendJson(`${API_URL}/api/categorias/${id}`, "PUT", categoria);
}

export function eliminarCategoria(id) {
  return apiFetch(`${API_URL}/api/categorias/${id}`, { method: "DELETE" });
}

export function getMovimientos({ tipo, desde, hasta, categoria_id, lugar_id } = {}) {
  return apiFetch(
    `${API_URL}/api/movimientos${buildQuery({ tipo, desde, hasta, categoria_id, lugar_id })}`
  );
}

export function getBalance({ desde, hasta } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`${API_URL}/api/balance${qs}`);
}

function buildQuery(params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  return qs ? `?${qs}` : "";
}

export function getMetricasPorCategoria({ tipo, desde, hasta }) {
  return apiFetch(`${API_URL}/api/metricas/por-categoria${buildQuery({ tipo, desde, hasta })}`);
}

export function getMetricasPorLugar({ tipo, desde, hasta } = {}) {
  return apiFetch(`${API_URL}/api/metricas/por-lugar${buildQuery({ tipo, desde, hasta })}`);
}

export function getMetricasPorMes(anio) {
  return apiFetch(`${API_URL}/api/metricas/por-mes${buildQuery({ anio })}`);
}

export function getMetricasResumen({ desde, hasta } = {}) {
  return apiFetch(`${API_URL}/api/metricas/resumen${buildQuery({ desde, hasta })}`);
}

export function getMetricasSerieMensual(meses) {
  return apiFetch(`${API_URL}/api/metricas/serie-mensual${buildQuery({ meses })}`);
}

export function getMetricasProyeccionMes() {
  return apiFetch(`${API_URL}/api/metricas/proyeccion-mes`);
}

export function getMetricasCategoriaEvolucion({ tipo, meses }) {
  return apiFetch(`${API_URL}/api/metricas/categoria-evolucion${buildQuery({ tipo, meses })}`);
}

export function getMetricasLugarCategoria({ tipo, desde, hasta } = {}) {
  return apiFetch(`${API_URL}/api/metricas/lugar-categoria${buildQuery({ tipo, desde, hasta })}`);
}

export function getMetricasHabitos({ tipo, desde, hasta, umbralHormiga }) {
  return apiFetch(
    `${API_URL}/api/metricas/habitos${buildQuery({ tipo, desde, hasta, umbralHormiga })}`
  );
}

export function getMetricasCalidad() {
  return apiFetch(`${API_URL}/api/metricas/calidad`);
}

export function getMetricasAvanzadas(meses) {
  return apiFetch(`${API_URL}/api/metricas/avanzadas${buildQuery({ meses })}`);
}

export function crearMovimiento(movimiento) {
  return sendJson(`${API_URL}/api/movimientos`, "POST", movimiento);
}

export function actualizarMovimiento(id, movimiento) {
  return sendJson(`${API_URL}/api/movimientos/${id}`, "PUT", movimiento);
}

export function eliminarMovimiento(id) {
  return apiFetch(`${API_URL}/api/movimientos/${id}`, { method: "DELETE" });
}
