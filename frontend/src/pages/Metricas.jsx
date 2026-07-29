import { useEffect, useState } from "react";
import BarList from "../components/BarList.jsx";
import MonthlyTrendChart from "../components/MonthlyTrendChart.jsx";
import {
  getCategorias,
  getLugares,
  getMetricasPorCategoria,
  getMetricasPorLugar,
  getMetricasPorMes,
} from "../api.js";
import { buildColorMap } from "../theme/colors.js";
import { primerDiaDelMes, hoy } from "../utils/fechas.js";

function Metricas() {
  const [tipo, setTipo] = useState("egreso");
  const [porCategoria, setPorCategoria] = useState(null);
  const [porLugar, setPorLugar] = useState(null);
  const [porMes, setPorMes] = useState(null);
  const [colorCategoria, setColorCategoria] = useState(() => new Map());
  const [colorLugar, setColorLugar] = useState(() => new Map());
  const [error, setError] = useState(null);

  const desde = primerDiaDelMes();
  const hasta = hoy();

  useEffect(() => {
    getLugares()
      .then((lugares) => setColorLugar(buildColorMap(lugares)))
      .catch((err) => setError(err.message));
    getMetricasPorMes(new Date().getFullYear())
      .then(setPorMes)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getCategorias(tipo)
      .then((cats) => setColorCategoria(buildColorMap(cats)))
      .catch((err) => setError(err.message));

    getMetricasPorCategoria({ tipo, desde, hasta })
      .then((data) =>
        setPorCategoria(
          data.map((d) => ({ id: d.categoria_id, label: d.categoria_nombre, total: d.total }))
        )
      )
      .catch((err) => setError(err.message));

    getMetricasPorLugar({ tipo, desde, hasta })
      .then((data) =>
        setPorLugar(data.map((d) => ({ id: d.lugar_id, label: d.lugar_nombre, total: d.total })))
      )
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  return (
    <div className="metricas">
      {error && <p className="form-error">{error}</p>}

      <section>
        <div className="metricas-header">
          <h2>Este mes por categoria y lugar</h2>
          <div className="field-row">
            <label>
              <input
                type="radio"
                name="metrica-tipo"
                value="egreso"
                checked={tipo === "egreso"}
                onChange={(e) => setTipo(e.target.value)}
              />
              Gastos
            </label>
            <label>
              <input
                type="radio"
                name="metrica-tipo"
                value="ingreso"
                checked={tipo === "ingreso"}
                onChange={(e) => setTipo(e.target.value)}
              />
              Ingresos
            </label>
          </div>
        </div>

        <div className="metricas-grid">
          <div>
            <h3>Por categoria</h3>
            {porCategoria === null ? (
              <p>Cargando...</p>
            ) : (
              <BarList
                items={porCategoria}
                colorFor={(id) => colorCategoria.get(id) || "#9a9a94"}
              />
            )}
          </div>
          <div>
            <h3>Por lugar</h3>
            {porLugar === null ? (
              <p>Cargando...</p>
            ) : (
              <BarList items={porLugar} colorFor={(id) => colorLugar.get(id) || "#9a9a94"} />
            )}
          </div>
        </div>
      </section>

      <section>
        <h2>Evolucion del año</h2>
        {porMes === null ? <p>Cargando...</p> : <MonthlyTrendChart datos={porMes} />}
      </section>
    </div>
  );
}

export default Metricas;
