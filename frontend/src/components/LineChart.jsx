function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

// Grafico de lineas generico (SVG para los trazos + marcadores HTML superpuestos
// con el mismo patron de tooltip via CSS que el resto de la app).
// series: [{ label, color, values: number[], punteada?: bool, colorPorSigno?: bool }]
function LineChart({ labels, series, formatValue = formatMoney, mostrarCero = false }) {
  if (!labels.length) return <p className="chart-empty">Sin datos.</p>;

  const todosValores = series.flatMap((s) => s.values);
  let max = Math.max(...todosValores, mostrarCero ? 0 : -Infinity);
  let min = Math.min(...todosValores, mostrarCero ? 0 : Infinity);
  if (max === min) {
    max += 1;
    min -= 1;
  }
  const rango = max - min;

  const topPct = (v) => ((max - v) / rango) * 100;
  const leftPct = (i) => (labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100);

  const puntos = (values) =>
    values.map((v, i) => `${leftPct(i)},${topPct(v)}`).join(" ");

  return (
    <div className="linechart-wrap">
      {series.length > 1 && (
        <div className="chart-legend">
          {series.map((s) => (
            <span className="legend-item" key={s.label}>
              <span className="legend-swatch" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div className="linechart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="linechart-svg">
          {mostrarCero && min < 0 && max > 0 && (
            <line
              x1="0"
              x2="100"
              y1={topPct(0)}
              y2={topPct(0)}
              className="linechart-zero-line"
            />
          )}
          {series.map((s) => (
            <polyline
              key={s.label}
              points={puntos(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth="1.2"
              strokeDasharray={s.punteada ? "3,2" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {series.map((s) =>
          s.values.map((v, i) => (
            <span
              key={`${s.label}-${labels[i]}`}
              className="linechart-dot"
              data-tooltip={`${s.label} ${labels[i]}: ${formatValue(v)}`}
              style={{
                left: `${leftPct(i)}%`,
                top: `${topPct(v)}%`,
                background: s.colorPorSigno ? (v >= 0 ? "#1baf7a" : "#c0392b") : s.color,
              }}
            />
          ))
        )}
      </div>

      <div className="linechart-labels">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export default LineChart;
