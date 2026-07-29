import { useEffect, useState } from "react";
import { getLugares, crearLugar, actualizarLugar, eliminarLugar } from "../api.js";

function CuentasManager() {
  const [lugares, setLugares] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState("");
  const [error, setError] = useState(null);

  function cargar() {
    getLugares().then(setLugares).catch((err) => setError(err.message));
  }

  useEffect(cargar, []);

  function handleAgregar(ev) {
    ev.preventDefault();
    setError(null);
    if (!nuevoNombre.trim()) return;
    crearLugar(nuevoNombre.trim())
      .then(() => {
        setNuevoNombre("");
        cargar();
      })
      .catch((err) => setError(err.message));
  }

  function iniciarEdicion(lugar) {
    setEditandoId(lugar.id);
    setEditandoNombre(lugar.nombre);
  }

  function guardarEdicion(id) {
    setError(null);
    if (!editandoNombre.trim()) return;
    actualizarLugar(id, editandoNombre.trim())
      .then(() => {
        setEditandoId(null);
        cargar();
      })
      .catch((err) => setError(err.message));
  }

  function handleEliminar(lugar) {
    if (!window.confirm(`Eliminar la cuenta "${lugar.nombre}"?`)) return;
    setError(null);
    eliminarLugar(lugar.id)
      .then(cargar)
      .catch((err) => setError(err.message));
  }

  return (
    <div>
      {error && <p className="form-error">{error}</p>}

      <ul className="settings-list">
        {lugares.map((l) => (
          <li key={l.id}>
            {editandoId === l.id ? (
              <>
                <input
                  value={editandoNombre}
                  onChange={(e) => setEditandoNombre(e.target.value)}
                  autoFocus
                />
                <div className="settings-actions">
                  <button type="button" onClick={() => guardarEdicion(l.id)}>
                    Guardar
                  </button>
                  <button type="button" className="secundario" onClick={() => setEditandoId(null)}>
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{l.nombre}</span>
                <div className="settings-actions">
                  <button type="button" className="secundario" onClick={() => iniciarEdicion(l)}>
                    Editar
                  </button>
                  <button type="button" className="secundario" onClick={() => handleEliminar(l)}>
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {!lugares.length && <li className="chart-empty">Todavia no hay cuentas.</li>}
      </ul>

      <form className="settings-add-form" onSubmit={handleAgregar}>
        <input
          placeholder="Nueva cuenta (ej: Efectivo)"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>
    </div>
  );
}

export default CuentasManager;
