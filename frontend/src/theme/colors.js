export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a"];
export const OTHER_COLOR = "#9a9a94";
export const INGRESO_COLOR = "#1baf7a";
export const EGRESO_COLOR = "#c0392b";

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
