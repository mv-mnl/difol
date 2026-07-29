import CuentasManager from "../components/CuentasManager.jsx";
import CategoriasManager from "../components/CategoriasManager.jsx";

function Settings() {
  return (
    <div className="metricas">
      <section>
        <h2>Cuentas</h2>
        <p className="settings-hint">
          Los lugares a donde entra o sale el dinero (ej: Efectivo, Banco).
        </p>
        <CuentasManager />
      </section>

      <section>
        <h2>Categorias</h2>
        <p className="settings-hint">
          Cada categoria pertenece a un tipo de movimiento y es opcional al cargar.
        </p>
        <CategoriasManager />
      </section>
    </div>
  );
}

export default Settings;
