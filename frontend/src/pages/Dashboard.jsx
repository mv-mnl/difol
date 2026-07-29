import { useEffect, useState } from "react";
import { getBalance } from "../api.js";
import { primerDiaDelMes, hoy } from "../utils/fechas.js";

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function Dashboard() {
  const [total, setTotal] = useState(null);
  const [mes, setMes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getBalance(),
      getBalance({ desde: primerDiaDelMes(), hasta: hoy() }),
    ])
      .then(([totalBalance, mesBalance]) => {
        setTotal(totalBalance);
        setMes(mesBalance);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!total || !mes) return <p>Cargando balance...</p>;

  return (
    <div className="dashboard">
      <div className="balance-card">
        <span className="label">Balance total</span>
        <span className={`amount ${total.balance >= 0 ? "positivo" : "negativo"}`}>
          {formatMoney(total.balance)}
        </span>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="label">Ingresos este mes</span>
          <span className="amount positivo">{formatMoney(mes.ingresos)}</span>
        </div>
        <div className="stat-card">
          <span className="label">Gastos este mes</span>
          <span className="amount negativo">{formatMoney(mes.egresos)}</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
