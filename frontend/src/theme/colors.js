export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a"];
export const OTHER_COLOR = "#9a9a94";
// Colores de marca (barras, puntos, lineas) para ingreso/egreso. Distintos de
// los tonos usados para TEXTO de balance (ver .amount.positivo/.negativo en
// App.css): un verde/rojo mas suave funciona como relleno de grafico porque
// siempre va acompañado de una etiqueta con el valor, pero como texto solo
// (sin fondo ni etiqueta al lado) no llega al contraste minimo legible.
export const INGRESO_COLOR = "#1baf7a";
export const EGRESO_COLOR = "#d03b3b";

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Escala secuencial de un solo tono (mismo hue base, variando intensidad)
// para heatmaps: valor 0 -> casi transparente, valor max -> tono completo.
export function tonoSecuencial(hexBase, valor, max) {
  const { r, g, b } = hexToRgb(hexBase);
  const intensidad = max > 0 ? Math.max(valor / max, 0) : 0;
  const alpha = 0.12 + intensidad * 0.88;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

// Asigna un color estable por id (no por posicion en la respuesta filtrada),
// para que una categoria/lugar no cambie de color al cambiar el rango de fechas.
export function buildColorMap(items) {
  const sorted = [...items].sort((a, b) => a.id - b.id);
  const map = new Map();
  sorted.forEach((item, i) => {
    map.set(item.id, i < CATEGORICAL.length ? CATEGORICAL[i] : OTHER_COLOR);
  });
  return map;
}
