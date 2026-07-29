function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function BarList({ items, colorFor, emptyText = "Sin datos en este periodo." }) {
  if (!items.length) return <p className="chart-empty">{emptyText}</p>;

  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="bar-list" role="img" aria-label="Grafico de barras horizontales">
      {items.map((item) => (
        <div
          className="bar-row"
          key={item.id ?? item.label}
          data-tooltip={`${item.label}: ${formatMoney(item.total)}`}
        >
          <span className="bar-label">{item.label}</span>
          <span className="bar-track">
            <span
              className="bar-fill"
              style={{
                width: `${Math.max((item.total / max) * 100, 2)}%`,
                background: colorFor(item.id),
              }}
            />
          </span>
          <span className="bar-value">{formatMoney(item.total)}</span>
        </div>
      ))}
    </div>
  );
}

export default BarList;
