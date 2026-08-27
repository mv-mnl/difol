function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

const ALTURA_MAX = 100;

// Barras verticales delgadas genericas: distribucion por dia del mes,
// estacionalidad por mes calendario, diversificacion de categorias por mes, etc.
function VerticalBarChart({ items, color, formatValue = formatMoney, emptyText = "Sin datos." }) {
  if (!items.length) return <p className="chart-empty">{emptyText}</p>;

  const max = Math.max(...items.map((i) => i.total), 1);

  // Con muchas columnas (ej. 31 dias del mes) las etiquetas se solapan si se
  // muestran todas. En vez de exigir scroll horizontal, se deja que las
  // barras se angosten libremente y solo se rotulan como maximo ~8 columnas,
  // siempre incluyendo la primera y la ultima.
  const paso = Math.max(1, Math.ceil(items.length / 8));

  return (
    <div className="vbar-chart" role="img" aria-label="Grafico de barras verticales">
      {items.map((item, i) => (
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
          <span className="vbar-label">{i % paso === 0 || i === items.length - 1 ? item.label : ""}</span>
        </div>
      ))}
    </div>
  );
}

export default VerticalBarChart;
