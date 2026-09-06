import { useCallback, useEffect, useMemo, useState } from "react";
import MovimientoForm from "../components/MovimientoForm.jsx";
import MovimientosList from "../components/MovimientosList.jsx";
import { getMovimientos } from "../api.js";
import { hoy } from "../utils/fechas.js";

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function CargarMovimiento() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarMovimientos = useCallback(() => {
    setLoading(true);
    const fecha = hoy();
    getMovimientos({ desde: fecha, hasta: fecha })
      .then(setMovimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const totales = useMemo(() => {
    return movimientos.reduce(
      (acc, m) => {
        const monto = Number(m.monto);
        if (m.tipo === "ingreso") acc.ingresos += monto;
        else acc.egresos += monto;
        return acc;
      },
      { ingresos: 0, egresos: 0 }
    );
  }, [movimientos]);

  return (
    <>
      <MovimientoForm onCreated={cargarMovimientos} />

      <section className="movimientos-section">
        <h2>Movimientos de hoy</h2>
        {error && <p className="form-error">{error}</p>}
        {!loading && movimientos.length > 0 && (
          <div className="stat-row" style={{ marginBottom: 16 }}>
            <div className="stat-card">
              <span className="label">Ingreso total del dia</span>
              <span className="amount positivo">{formatMoney(totales.ingresos)}</span>
            </div>
            <div className="stat-card">
              <span className="label">Gasto total del dia</span>
              <span className="amount negativo">{formatMoney(totales.egresos)}</span>
            </div>
          </div>
        )}
        <MovimientosList movimientos={movimientos} loading={loading} />
      </section>
    </>
  );
}

export default CargarMovimiento;
