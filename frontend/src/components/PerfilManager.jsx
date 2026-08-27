import { useState } from "react";
import { actualizarPerfil } from "../api.js";

const initialPasswords = { password_actual: "", password_nueva: "", password_confirmar: "" };

function PerfilManager({ usuario, onActualizado }) {
  const [form, setForm] = useState({ nombre: usuario.nombre, email: usuario.email });
  const [passwords, setPasswords] = useState(initialPasswords);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updatePassword(field, value) {
    setPasswords((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError(null);
    setOk(false);

    if (cambiandoPassword && passwords.password_nueva !== passwords.password_confirmar) {
      setError("la nueva contrasena no coincide con la confirmacion");
      return;
    }

    const payload = { nombre: form.nombre.trim(), email: form.email.trim() };
    if (cambiandoPassword) {
      payload.password_actual = passwords.password_actual;
      payload.password_nueva = passwords.password_nueva;
    }

    setEnviando(true);
    try {
      const usuarioActualizado = await actualizarPerfil(payload);
      onActualizado(usuarioActualizado);
      setPasswords(initialPasswords);
      setCambiandoPassword(false);
      setOk(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="movimiento-form" onSubmit={handleSubmit}>
      <label className="field">
        Nombre
        <input
          type="text"
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          required
        />
      </label>

      <label className="field">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </label>

      {cambiandoPassword ? (
        <>
          <label className="field">
            Contrasena actual
            <input
              type="password"
              value={passwords.password_actual}
              onChange={(e) => updatePassword("password_actual", e.target.value)}
              required
            />
          </label>
          <label className="field">
            Contrasena nueva
            <input
              type="password"
              value={passwords.password_nueva}
              onChange={(e) => updatePassword("password_nueva", e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label className="field">
            Confirmar contrasena nueva
            <input
              type="password"
              value={passwords.password_confirmar}
              onChange={(e) => updatePassword("password_confirmar", e.target.value)}
              minLength={8}
              required
            />
          </label>
          <button
            type="button"
            className="secundario"
            onClick={() => {
              setCambiandoPassword(false);
              setPasswords(initialPasswords);
            }}
          >
            Cancelar cambio de contrasena
          </button>
        </>
      ) : (
        <button type="button" className="secundario" onClick={() => setCambiandoPassword(true)}>
          Cambiar contrasena
        </button>
      )}

      {error && <p className="form-error">{error}</p>}
      {ok && <p className="form-ok">Perfil actualizado.</p>}

      <div className="form-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

export default PerfilManager;
