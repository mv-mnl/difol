import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import CargarMovimiento from "./pages/CargarMovimiento.jsx";
import Metricas from "./pages/Metricas.jsx";
import Settings from "./pages/Settings.jsx";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "carga", label: "Cargar movimiento" },
  { id: "metricas", label: "Metricas" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="app">
      <header>
        <h1>Difol</h1>
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
        {tab === "metricas" && <Metricas />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}

export default App;
