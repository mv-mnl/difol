export function esFechaValida(str) {
  return (
    typeof str === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(str) &&
    !Number.isNaN(Date.parse(str))
  );
}

export function validarRangoFechas({ desde, hasta }) {
  if (desde !== undefined && !esFechaValida(desde)) {
    return "desde debe tener el formato YYYY-MM-DD";
  }
  if (hasta !== undefined && !esFechaValida(hasta)) {
    return "hasta debe tener el formato YYYY-MM-DD";
  }
  if (desde && hasta && desde > hasta) {
    return "desde no puede ser posterior a hasta";
  }
  return null;
}
