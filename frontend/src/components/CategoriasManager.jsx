import { useEffect, useState } from "react";
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../api.js";

function ColumnaTipo({ tipo, titulo, categorias, onChange }) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState("");
  const [error, setError] = useState(null);

  function handleAgregar(ev) {
    ev.preventDefault();
    setError(null);
    if (!nuevoNombre.trim()) return;
    crearCategoria({ nombre: nuevoNombre.trim(), tipo })
      .then(() => {
        setNuevoNombre("");
        onChange();
      })
      .catch((err) => setError(err.message));
  }

  function guardarEdicion(id) {
    setError(null);
    if (!editandoNombre.trim()) return;
    actualizarCategoria(id, { nombre: editandoNombre.trim(), tipo })
      .then(() => {
        setEditandoId(null);
        onChange();
      })
      .catch((err) => setError(err.message));
  }

  function handleEliminar(cat) {
    if (!window.confirm(`Eliminar la categoria "${cat.nombre}"?`)) return;
    setError(null);
    eliminarCategoria(cat.id).then(onChange).catch((err) => setError(err.message));
  }

  return (
    <div>
      <h3>{titulo}</h3>
      {error && <p className="form-error">{error}</p>}

      <ul className="settings-list">
        {categorias.map((c) => (
          <li key={c.id}>
            {editandoId === c.id ? (
              <>
                <input
                  value={editandoNombre}
                  onChange={(e) => setEditandoNombre(e.target.value)}
                  autoFocus
                />
                <div className="settings-actions">
                  <button type="button" onClick={() => guardarEdicion(c.id)}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => setEditandoId(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{c.nombre}</span>
                <div className="settings-actions">
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => {
                      setEditandoId(c.id);
                      setEditandoNombre(c.nombre);
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" className="secundario" onClick={() => handleEliminar(c)}>
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {!categorias.length && <li className="chart-empty">Sin categorias.</li>}
      </ul>

      <form className="settings-add-form" onSubmit={handleAgregar}>
        <input
          placeholder={`Nueva categoria de ${titulo.toLowerCase()}`}
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>
    </div>
  );
}

function CategoriasManager() {
  const [categorias, setCategorias] = useState([]);

  function cargar() {
    getCategorias().then(setCategorias);
  }

  useEffect(cargar, []);

  return (
    <div className="metricas-grid">
      <ColumnaTipo
        tipo="egreso"
        titulo="Gastos"
        categorias={categorias.filter((c) => c.tipo === "egreso")}
        onChange={cargar}
      />
      <ColumnaTipo
        tipo="ingreso"
        titulo="Ingresos"
        categorias={categorias.filter((c) => c.tipo === "ingreso")}
        onChange={cargar}
      />
    </div>
  );
}

export default CategoriasManager;
