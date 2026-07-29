import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [status, setStatus] = useState("cargando...");

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("sin conexion al backend"));
  }, []);

  return (
    <div>
      <h1>Difol</h1>
      <p>Estado backend: {status}</p>
    </div>
  );
}

export default App;
