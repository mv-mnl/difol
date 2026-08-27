import { useEffect, useState } from "react";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CargarMovimiento from "./pages/CargarMovimiento.jsx";
import Movimientos from "./pages/Movimientos.jsx";
import Metricas from "./pages/Metricas.jsx";
import Settings from "./pages/Settings.jsx";
import { getToken, clearToken, getUsuarioActual } from "./api.js";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "carga", label: "Cargar movimiento" },
  { id: "movimientos", label: "Movimientos" },
  { id: "metricas", label: "Metricas" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [tab, setTab] = useState("dashboard");
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setCargandoSesion(false);
      return;
    }
    getUsuarioActual()
      .then(setUsuario)
      .catch(() => clearToken())
      .finally(() => setCargandoSesion(false));
  }, []);

  function handleLogout() {
    clearToken();
    setUsuario(null);
  }

  if (cargandoSesion) {
    return null;
  }

  if (!usuario) {
    return <Auth onAutenticado={setUsuario} />;
  }

  return (
    <div className="app">
      <header>
        <div className="app-header-top">
          <h1>Difol</h1>
          <div className="app-user-bar">
            <span>{usuario.nombre}</span>
            <button type="button" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === "dashboard" && <Dashboard />}
        {tab === "carga" && <CargarMovimiento />}
        {tab === "movimientos" && <Movimientos />}
        {tab === "metricas" && <Metricas />}
        {tab === "settings" && <Settings usuario={usuario} onUsuarioActualizado={setUsuario} />}
      </main>
    </div>
  );
}

export default App;
