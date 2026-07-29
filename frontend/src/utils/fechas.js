export function primerDiaDelMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function hoy() {
  return new Date().toISOString().slice(0, 10);
}
