import { useEffect, useState } from "react";
import { getLugares, getCategorias, crearMovimiento } from "../api.js";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

const initialState = {
  tipo: "egreso",
  monto: "",
  fecha: hoy(),
  descripcion: "",
  categoria_id: "",
  lugar_id: "",
};

function MovimientoForm({ onCreated }) {
  const [lugares, setLugares] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getLugares().then(setLugares).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getCategorias(form.tipo)
      .then((cats) => {
        setCategorias(cats);
        setForm((f) =>
          cats.some((c) => String(c.id) === String(f.categoria_id))
            ? f
            : { ...f, categoria_id: "" }
        );
      })
      .catch((err) => setError(err.message));
  }, [form.tipo]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError(null);

    const monto = Number(form.monto);
    if (!form.lugar_id) {
      setError("elegí un lugar");
      return;
    }
    if (!monto || monto <= 0) {
      setError("el monto debe ser un numero positivo");
      return;
    }

    setEnviando(true);
    try {
      await crearMovimiento({
        tipo: form.tipo,
        monto,
        fecha: form.fecha,
        descripcion: form.descripcion || undefined,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        lugar_id: Number(form.lugar_id),
      });
      setForm((f) => ({
        ...initialState,
        tipo: f.tipo,
        lugar_id: f.lugar_id,
      }));
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="movimiento-form" onSubmit={handleSubmit}>
      <h2>Cargar movimiento</h2>

      <div className="field-row">
        <label>
          <input
            type="radio"
            name="tipo"
            value="egreso"
            checked={form.tipo === "egreso"}
            onChange={(e) => update("tipo", e.target.value)}
          />
          Gasto
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="ingreso"
            checked={form.tipo === "ingreso"}
            onChange={(e) => update("tipo", e.target.value)}
          />
          Ingreso
        </label>
      </div>

      <label className="field">
        Monto
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.monto}
          onChange={(e) => update("monto", e.target.value)}
          required
        />
      </label>

      <label className="field">
        Fecha
        <input
          type="date"
          value={form.fecha}
          onChange={(e) => update("fecha", e.target.value)}
          required
        />
      </label>

      <label className="field">
        Lugar
        <select
          value={form.lugar_id}
          onChange={(e) => update("lugar_id", e.target.value)}
          required
        >
          <option value="">Seleccionar...</option>
          {lugares.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Categoria (opcional)
        <select
          value={form.categoria_id}
          onChange={(e) => update("categoria_id", e.target.value)}
        >
          <option value="">Sin categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Descripcion (opcional)
        <input
          type="text"
          value={form.descripcion}
          onChange={(e) => update("descripcion", e.target.value)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default MovimientoForm;
