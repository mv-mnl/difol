function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

const ALTURA_MAX = 100;

// Barras verticales delgadas genericas: distribucion por dia del mes,
// estacionalidad por mes calendario, diversificacion de categorias por mes, etc.
function VerticalBarChart({ items, color, formatValue = formatMoney, emptyText = "Sin datos." }) {
  if (!items.length) return <p className="chart-empty">{emptyText}</p>;

  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="vbar-chart" role="img" aria-label="Grafico de barras verticales">
      {items.map((item) => (
        <div className="vbar-col" key={item.label}>
          <div className="vbar-track">
            <span
              className="vbar-fill"
              data-tooltip={`${item.label}: ${formatValue(item.total)}`}
              style={{
                height: item.total ? `${Math.max((item.total / max) * ALTURA_MAX, 3)}%` : 0,
                background: color,
              }}
            />
          </div>
          <span className="vbar-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default VerticalBarChart;
