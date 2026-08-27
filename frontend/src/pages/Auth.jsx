import { useState } from "react";
import { registrar, login, setToken } from "../api.js";

function Auth({ onAutenticado }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [form, setForm] = useState({ email: "", password: "", nombre: "" });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { token, usuario } =
        modo === "login" ? await login(form) : await registrar(form);
      setToken(token);
      onAutenticado(usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="movimiento-form auth-form" onSubmit={handleSubmit}>
        <h2>{modo === "login" ? "Iniciar sesion" : "Crear cuenta"}</h2>

        {modo === "registro" && (
          <label className="field">
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
              required
            />
          </label>
        )}

        <label className="field">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>

        <label className="field">
          Contrasena
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={enviando}>
            {enviando
              ? "Enviando..."
              : modo === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </div>

        <p className="auth-switch">
          {modo === "login" ? (
            <>
              No tenes cuenta todavia?{" "}
              <button type="button" onClick={() => setModo("registro")}>
                Registrate
              </button>
            </>
          ) : (
            <>
              Ya tenes cuenta?{" "}
              <button type="button" onClick={() => setModo("login")}>
                Inicia sesion
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default Auth;
