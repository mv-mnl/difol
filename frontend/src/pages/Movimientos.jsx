import { useCallback, useEffect, useState } from "react";
import MovimientoForm from "../components/MovimientoForm.jsx";
import MovimientosList from "../components/MovimientosList.jsx";
import { getMovimientos, eliminarMovimiento, getCategorias, getLugares } from "../api.js";

function Movimientos() {
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [lugarId, setLugarId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    getMovimientos({
      tipo: tipo || undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      categoria_id: categoriaId || undefined,
      lugar_id: lugarId || undefined,
    })
      .then(setMovimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tipo, desde, hasta, categoriaId, lugarId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    getLugares().then(setLugares).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getCategorias(tipo || undefined)
      .then((data) => {
        setCategorias(data);
        if (categoriaId && !data.some((c) => String(c.id) === categoriaId)) {
          setCategoriaId("");
        }
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  function handleGuardado() {
    setEditando(null);
    cargar();
  }

  function handleEliminar(movimiento) {
    if (
      !window.confirm(
        `Eliminar el movimiento de ${movimiento.lugar_nombre} por $${Number(movimiento.monto).toFixed(2)}?`
      )
    ) {
      return;
    }
    setError(null);
    eliminarMovimiento(movimiento.id)
      .then(() => {
        if (editando?.id === movimiento.id) setEditando(null);
        cargar();
      })
      .catch((err) => setError(err.message));
  }

  return (
    <div className="metricas">
      {editando && (
        <MovimientoForm
          key={editando.id}
          movimiento={editando}
          onSaved={handleGuardado}
          onCancel={() => setEditando(null)}
        />
      )}

      <section className="metricas-section">
        <div className="metricas-header">
          <h2>Movimientos</h2>
          <div className="field-row">
            <label className="field">
              Tipo
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="egreso">Gastos</option>
                <option value="ingreso">Ingresos</option>
              </select>
            </label>
            <label className="field">
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>
            <label className="field">
              Hasta
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>
            <label className="field">
              Categoria
              <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Lugar
              <select value={lugarId} onChange={(e) => setLugarId(e.target.value)}>
                <option value="">Todos</option>
                {lugares.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        <MovimientosList
          movimientos={movimientos}
          loading={loading}
          onEdit={setEditando}
          onDelete={handleEliminar}
        />
      </section>
    </div>
  );
}

export default Movimientos;
