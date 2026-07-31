import { tonoSecuencial } from "../theme/colors.js";

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

// Matriz lugar x categoria: cada celda se pinta con un solo tono (secuencial)
// segun su intensidad relativa al valor maximo de toda la matriz.
function Heatmap({ filas, columnas, datos, colorBase, emptyText = "Sin datos en este periodo." }) {
  if (!datos.length) return <p className="chart-empty">{emptyText}</p>;

  const valorPor = (filaId, colId) =>
    datos.find(
      (d) => d.lugar_id === filaId && (d.categoria_id ?? null) === (colId ?? null)
    )?.total || 0;

  const max = Math.max(...datos.map((d) => d.total), 1);

  return (
    <div className="table-scroll">
      <table className="heatmap">
        <thead>
          <tr>
            <th />
            {columnas.map((c) => (
              <th key={c.id ?? "sin-categoria"}>{c.nombre}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <th className="heatmap-row-label">{f.nombre}</th>
              {columnas.map((c) => {
                const valor = valorPor(f.id, c.id);
                return (
                  <td
                    key={c.id ?? "sin-categoria"}
                    className="heatmap-cell"
                    data-tooltip={`${f.nombre} · ${c.nombre}: ${formatMoney(valor)}`}
                    style={{ background: tonoSecuencial(colorBase, valor, max) }}
                  >
                    {valor > 0 ? formatMoney(valor) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Heatmap;
