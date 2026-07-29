import { useCallback, useEffect, useState } from "react";
import MovimientoForm from "../components/MovimientoForm.jsx";
import MovimientosList from "../components/MovimientosList.jsx";
import { getMovimientos } from "../api.js";

function CargarMovimiento() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarMovimientos = useCallback(() => {
    setLoading(true);
    getMovimientos()
      .then(setMovimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  return (
    <>
      <MovimientoForm onCreated={cargarMovimientos} />

      <section className="movimientos-section">
        <h2>Movimientos recientes</h2>
        {error && <p className="form-error">{error}</p>}
        <MovimientosList movimientos={movimientos} loading={loading} />
      </section>
    </>
  );
}

export default CargarMovimiento;
