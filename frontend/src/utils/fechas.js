export function primerDiaDelMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function primerDiaHaceMeses(n) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (n - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatoFecha(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Lunes de la semana actual.
export function primerDiaDeLaSemana() {
  const d = new Date();
  const diaSemana = (d.getDay() + 6) % 7; // 0 = lunes ... 6 = domingo
  d.setDate(d.getDate() - diaSemana);
  return formatoFecha(d);
}

export function primerDiaDelTrimestre() {
  const d = new Date();
  const mesTrimestre = Math.floor(d.getMonth() / 3) * 3;
  return `${d.getFullYear()}-${String(mesTrimestre + 1).padStart(2, "0")}-01`;
}

export function primerDiaDelAnio() {
  return `${new Date().getFullYear()}-01-01`;
}

export const PERIODOS = [
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "trimestre", label: "Este trimestre" },
  { key: "anio", label: "Este año" },
  { key: "personalizado", label: "Personalizado" },
];

// Calcula { desde, hasta } para un preset de periodo (no aplica a "personalizado").
export function rangoPeriodo(periodo) {
  const desdePorPeriodo = {
    semana: primerDiaDeLaSemana,
    mes: primerDiaDelMes,
    trimestre: primerDiaDelTrimestre,
    anio: primerDiaDelAnio,
  };
  const fn = desdePorPeriodo[periodo] || primerDiaDelMes;
  return { desde: fn(), hasta: hoy() };
}

export const MESES_ABR = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];
