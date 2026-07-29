import { useEffect, useState } from "react";
import { getLugares, getCategorias, crearMovimiento } from "../api.js";

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeMonto(value) {
  const soloNumeros = value.replace(/[^0-9.]/g, "");
  const [entero, ...resto] = soloNumeros.split(".");
  return resto.length ? `${entero}.${resto.join("")}` : entero;
}

const TECLAS_CONTROL = [
  "Backspace", "Delete", "Tab", "Escape", "Enter",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
];

function esTeclaPermitida(e) {
  if (e.ctrlKey || e.metaKey) return true;
  if (TECLAS_CONTROL.includes(e.key)) return true;
  return e.key === "." || /^[0-9]$/.test(e.key);
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
            : { ...f, categoria_id: cats.length ? String(cats[0].id) : "" }
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
        categoria_id: categorias.length ? String(categorias[0].id) : "",
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
          type="text"
          inputMode="decimal"
          value={form.monto}
          onChange={(e) => {
            const limpio = sanitizeMonto(e.target.value);
            e.target.value = limpio;
            update("monto", limpio);
          }}
          onKeyDown={(e) => {
            if (!esTeclaPermitida(e)) e.preventDefault();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const texto = e.clipboardData.getData("text");
            update("monto", sanitizeMonto(form.monto + texto));
          }}
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

      <div className="field">
        Lugar
        <div className="lugar-buttons" role="radiogroup" aria-label="Lugar">
          {lugares.map((l) => (
            <label
              key={l.id}
              className={`lugar-btn ${String(form.lugar_id) === String(l.id) ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="lugar_id"
                value={l.id}
                checked={String(form.lugar_id) === String(l.id)}
                onChange={(e) => update("lugar_id", e.target.value)}
              />
              {l.nombre}
            </label>
          ))}
          {!lugares.length && (
            <span className="chart-empty">No hay cuentas cargadas — agregalas en Settings.</span>
          )}
        </div>
      </div>

      <div className="field">
        Categoria (opcional)
        <div className="lugar-buttons" role="radiogroup" aria-label="Categoria">
          {categorias.map((c) => (
            <label
              key={c.id}
              className={`lugar-btn ${String(form.categoria_id) === String(c.id) ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="categoria_id"
                value={c.id}
                checked={String(form.categoria_id) === String(c.id)}
                onChange={(e) => update("categoria_id", e.target.value)}
              />
              {c.nombre}
            </label>
          ))}
          <label className={`lugar-btn ${!form.categoria_id ? "selected" : ""}`}>
            <input
              type="radio"
              name="categoria_id"
              value=""
              checked={!form.categoria_id}
              onChange={() => update("categoria_id", "")}
            />
            Sin categoria
          </label>
        </div>
      </div>

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
