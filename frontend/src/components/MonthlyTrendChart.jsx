import { INGRESO_COLOR, EGRESO_COLOR } from "../theme/colors.js";
import { MESES_ABR } from "../utils/fechas.js";

const ALTURA_MAX = 150; // debe coincidir con la altura de .trend-bars en App.css

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function barHeight(value, max) {
  if (!value) return 0;
  return Math.max((value / max) * ALTURA_MAX, 3);
}

function MonthlyTrendChart({ datos }) {
  const max = Math.max(...datos.map((d) => Math.max(d.ingresos, d.egresos)), 1);

  // Igual que en VerticalBarChart: si hubiera muchos meses, se rotulan como
  // maximo ~8 en vez de solaparlos o exigir scroll horizontal (las barras se
  // angostan libremente via CSS para caber siempre).
  const paso = Math.max(1, Math.ceil(datos.length / 8));

  return (
    <div className="trend-chart-wrap">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: INGRESO_COLOR }} />
          Ingresos
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: EGRESO_COLOR }} />
          Egresos
        </span>
      </div>

      <div className="trend-chart">
        {datos.map((d, i) => (
          <div className="trend-month" key={d.mes}>
            <div className="trend-bars">
              <span
                className="trend-bar"
                data-tooltip={`Ingresos ${d.mes}: ${formatMoney(d.ingresos)}`}
                style={{ height: barHeight(d.ingresos, max), background: INGRESO_COLOR }}
              />
              <span
                className="trend-bar"
                data-tooltip={`Egresos ${d.mes}: ${formatMoney(d.egresos)}`}
                style={{ height: barHeight(d.egresos, max), background: EGRESO_COLOR }}
              />
            </div>
            <span className="trend-month-label">
              {i % paso === 0 || i === datos.length - 1 ? MESES_ABR[Number(d.mes.slice(5, 7)) - 1] : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthlyTrendChart;
