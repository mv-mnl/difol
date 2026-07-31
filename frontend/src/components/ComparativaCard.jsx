function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

// Compara un valor actual contra uno de referencia (mes anterior, mismo mes
// año anterior, etc). "favorableSiSube" indica si un aumento es una buena
// noticia (ingreso) o mala (egreso), para pintar la variacion en verde/rojo.
function ComparativaCard({ titulo, actual, referencia, favorableSiSube = false }) {
  const variacionAbs = actual - referencia;
  const variacionPct = referencia !== 0 ? (variacionAbs / Math.abs(referencia)) * 100 : null;
  const sube = variacionAbs > 0;
  const esFavorable = variacionAbs === 0 ? null : sube === favorableSiSube;

  return (
    <div className="comparativa-card">
      <span className="label">{titulo}</span>
      <span className="stat-tile-value">{formatMoney(actual)}</span>
      <span className={`comparativa-variacion ${esFavorable === null ? "" : esFavorable ? "positivo" : "negativo"}`}>
        {sube ? "▲" : variacionAbs < 0 ? "▼" : "–"} {formatMoney(Math.abs(variacionAbs))}
        {variacionPct !== null && ` (${variacionPct >= 0 ? "+" : ""}${variacionPct.toFixed(1)}%)`}
      </span>
      <span className="stat-tile-sub">vs {formatMoney(referencia)}</span>
    </div>
  );
}

export default ComparativaCard;
