import { INGRESO_COLOR, EGRESO_COLOR } from "../theme/colors.js";
import { MESES_ABR } from "../utils/fechas.js";

const ALTURA_MAX = 140;

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function barHeight(value, max) {
  if (!value) return 0;
  return Math.max((value / max) * ALTURA_MAX, 3);
}

function MonthlyTrendChart({ datos }) {
  const max = Math.max(...datos.map((d) => Math.max(d.ingresos, d.egresos)), 1);

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
        {datos.map((d) => (
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
            <span className="trend-month-label">{MESES_ABR[Number(d.mes.slice(5, 7)) - 1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthlyTrendChart;
