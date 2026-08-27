import { useEffect, useMemo, useState } from "react";
import BarList from "../components/BarList.jsx";
import MonthlyTrendChart from "../components/MonthlyTrendChart.jsx";
import LineChart from "../components/LineChart.jsx";
import VerticalBarChart from "../components/VerticalBarChart.jsx";
import Heatmap from "../components/Heatmap.jsx";
import StatTile from "../components/StatTile.jsx";
import ComparativaCard from "../components/ComparativaCard.jsx";
import {
  getCategorias,
  getLugares,
  getMetricasPorCategoria,
  getMetricasPorLugar,
  getMetricasPorMes,
  getMetricasResumen,
  getMetricasSerieMensual,
  getMetricasProyeccionMes,
  getMetricasCategoriaEvolucion,
  getMetricasLugarCategoria,
  getMetricasHabitos,
  getMetricasCalidad,
  getMetricasAvanzadas,
} from "../api.js";
import { buildColorMap } from "../theme/colors.js";
import { INGRESO_COLOR, EGRESO_COLOR } from "../theme/colors.js";
import { primerDiaDelMes, primerDiaHaceMeses, hoy, MESES_ABR } from "../utils/fechas.js";

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function formatPct(n, digitos = 1) {
  return `${Number(n).toFixed(digitos)}%`;
}

function mesLabel(mes) {
  return `${MESES_ABR[Number(mes.slice(5, 7)) - 1]} ${mes.slice(2, 4)}`;
}

function promedioMovil(valores, ventana) {
  return valores.map((_, i) => {
    const desde = Math.max(0, i - ventana + 1);
    const tramo = valores.slice(desde, i + 1);
    return tramo.reduce((a, b) => a + b, 0) / tramo.length;
  });
}

function Metricas() {
  const [tipo, setTipo] = useState("egreso");
  const [error, setError] = useState(null);

  // Seccion 1: flujo general
  const [resumenMes, setResumenMes] = useState(null);
  const [proyeccion, setProyeccion] = useState(null);
  const [serieMensual, setSerieMensual] = useState(null);

  // Seccion 2 y 3: categoria / lugar (mes en curso)
  const [porCategoria, setPorCategoria] = useState(null);
  const [porLugar, setPorLugar] = useState(null);
  const [colorCategoria, setColorCategoria] = useState(() => new Map());
  const [colorLugar, setColorLugar] = useState(() => new Map());
  const [categoriasTipo, setCategoriasTipo] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [categoriaEvolucion, setCategoriaEvolucion] = useState(null);
  const [lugarCategoria, setLugarCategoria] = useState(null);
  const [lugaresTotales, setLugaresTotales] = useState(null);

  // Evolucion del año calendario (grafico existente)
  const [porMes, setPorMes] = useState(null);

  // Seccion 4: habitos
  const [habitos, setHabitos] = useState(null);

  // Seccion 7: calidad
  const [calidad, setCalidad] = useState(null);

  // Seccion 8: avanzadas
  const [avanzadas, setAvanzadas] = useState(null);

  const desdeMes = primerDiaDelMes();
  const hastaHoy = hoy();

  useEffect(() => {
    getLugares()
      .then((lugares) => setColorLugar(buildColorMap(lugares)))
      .catch((err) => setError(err.message));
    getMetricasPorMes(new Date().getFullYear())
      .then(setPorMes)
      .catch((err) => setError(err.message));
    getMetricasResumen({ desde: desdeMes, hasta: hastaHoy })
      .then(setResumenMes)
      .catch((err) => setError(err.message));
    getMetricasProyeccionMes()
      .then(setProyeccion)
      .catch((err) => setError(err.message));
    getMetricasSerieMensual(24)
      .then(setSerieMensual)
      .catch((err) => setError(err.message));
    getMetricasCalidad()
      .then(setCalidad)
      .catch((err) => setError(err.message));
    getMetricasAvanzadas(24)
      .then(setAvanzadas)
      .catch((err) => setError(err.message));
    getMetricasPorLugar({ tipo: "egreso" })
      .then(setLugaresTotales)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCategorias(tipo)
      .then((cats) => {
        setColorCategoria(buildColorMap(cats));
        setCategoriasTipo(cats);
        setCategoriaSeleccionada((actual) =>
          cats.some((c) => c.id === actual) ? actual : cats[0]?.id ?? null
        );
      })
      .catch((err) => setError(err.message));

    getMetricasPorCategoria({ tipo, desde: desdeMes, hasta: hastaHoy })
      .then((data) =>
        setPorCategoria(
          data.map((d) => ({ id: d.categoria_id, label: d.categoria_nombre, total: d.total }))
        )
      )
      .catch((err) => setError(err.message));

    getMetricasPorLugar({ tipo, desde: desdeMes, hasta: hastaHoy })
      .then((data) =>
        setPorLugar(data.map((d) => ({ id: d.lugar_id, label: d.lugar_nombre, total: d.total })))
      )
      .catch((err) => setError(err.message));

    getMetricasCategoriaEvolucion({ tipo, meses: 12 })
      .then(setCategoriaEvolucion)
      .catch((err) => setError(err.message));

    getMetricasLugarCategoria({ tipo, desde: desdeMes, hasta: hastaHoy })
      .then(setLugarCategoria)
      .catch((err) => setError(err.message));

    getMetricasHabitos({ tipo, desde: primerDiaHaceMeses(12), hasta: hastaHoy })
      .then(setHabitos)
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const comparativas = useMemo(() => {
    if (!serieMensual || serieMensual.length < 2) return null;
    const campo = tipo === "ingreso" ? "ingresos" : "egresos";
    const n = serieMensual.length;
    const actual = serieMensual[n - 1];
    const anterior = serieMensual[n - 2];
    const mismoMesAnioAnterior = n >= 13 ? serieMensual[n - 13] : null;
    return { actual, anterior, mismoMesAnioAnterior, campo };
  }, [serieMensual, tipo]);

  const promedioMovilData = useMemo(() => {
    if (!serieMensual) return null;
    const campo = tipo === "ingreso" ? "ingresos" : "egresos";
    const valores = serieMensual.map((m) => m[campo]);
    return { labels: serieMensual.map((m) => mesLabel(m.mes)), valores, ma: promedioMovil(valores, 3) };
  }, [serieMensual, tipo]);

  const estacionalidad = useMemo(() => {
    if (!serieMensual) return null;
    const campo = tipo === "ingreso" ? "ingresos" : "egresos";
    const porMesCalendario = Array.from({ length: 12 }, () => []);
    serieMensual.forEach((m) => {
      const idx = Number(m.mes.slice(5, 7)) - 1;
      porMesCalendario[idx].push(m[campo]);
    });
    return porMesCalendario.map((valores, i) => ({
      label: MESES_ABR[i],
      total: valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0,
    }));
  }, [serieMensual, tipo]);

  const categoriaEvolData = useMemo(() => {
    if (!categoriaEvolucion || categoriaSeleccionada === null) return null;
    const c = categoriaEvolucion.find(
      (x) => (x.categoria_id ?? "sin-categoria") === (categoriaSeleccionada ?? "sin-categoria")
    );
    if (!c) return null;
    return { labels: c.meses.map((m) => mesLabel(m.mes)), valores: c.meses.map((m) => m.total) };
  }, [categoriaEvolucion, categoriaSeleccionada]);

  const mayorVariacion = useMemo(() => {
    if (!categoriaEvolucion) return null;
    let peor = null;
    categoriaEvolucion.forEach((c) => {
      const valores = c.meses.map((m) => m.total);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      if (media === 0) return;
      const varianza = valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / valores.length;
      const coefVariacion = Math.sqrt(varianza) / media;
      if (!peor || coefVariacion > peor.coefVariacion) {
        peor = { nombre: c.categoria_nombre, coefVariacion };
      }
    });
    return peor;
  }, [categoriaEvolucion]);

  const porcentajeEfectivo = useMemo(() => {
    if (!lugaresTotales || !lugaresTotales.length) return null;
    const total = lugaresTotales.reduce((a, r) => a + r.total, 0);
    const efectivo = lugaresTotales
      .filter((r) => r.lugar_nombre.trim().toLowerCase() === "efectivo")
      .reduce((a, r) => a + r.total, 0);
    const masUsado = [...lugaresTotales].sort((a, b) => b.cantidad - a.cantidad)[0];
    return { pct: total > 0 ? (efectivo / total) * 100 : 0, masUsado };
  }, [lugaresTotales]);

  const lugarCategoriaFilas = useMemo(() => {
    if (!lugarCategoria) return [];
    return [...new Map(lugarCategoria.map((d) => [d.lugar_id, { id: d.lugar_id, nombre: d.lugar_nombre }])).values()];
  }, [lugarCategoria]);

  const lugarCategoriaColumnas = useMemo(() => {
    if (!lugarCategoria) return [];
    return [...new Map(
      lugarCategoria.map((d) => [d.categoria_id ?? "sin-categoria", { id: d.categoria_id, nombre: d.categoria_nombre }])
    ).values()];
  }, [lugarCategoria]);

  return (
    <div className="metricas">
      {error && <p className="form-error">{error}</p>}

      {/* Seccion 1: flujo general */}
      <section className="metricas-section">
        <h2>Flujo de dinero — este mes</h2>
        {resumenMes && (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <StatTile label="Ingresos" value={formatMoney(resumenMes.ingresos)} />
            <StatTile label="Egresos" value={formatMoney(resumenMes.egresos)} />
            <StatTile
              label="Balance neto"
              value={formatMoney(resumenMes.balance)}
              sub={resumenMes.tasaAhorro !== null ? `Ahorro: ${formatPct(resumenMes.tasaAhorro * 100)}` : "—"}
            />
            {proyeccion && (
              <StatTile
                label="Proyeccion de gasto del mes"
                value={formatMoney(proyeccion.proyeccionGasto)}
                sub={`Dia ${proyeccion.diasTranscurridos} de ${proyeccion.diasEnMes}`}
              />
            )}
          </div>
        )}

        <h3 style={{ marginTop: 24 }}>Balance acumulado (24 meses)</h3>
        {serieMensual === null ? (
          <p>Cargando...</p>
        ) : (
          <LineChart
            labels={serieMensual.map((m) => mesLabel(m.mes))}
            series={[{ label: "Balance acumulado", color: "#1c232b", values: serieMensual.map((m) => m.balanceAcumulado), colorPorSigno: true }]}
            mostrarCero
          />
        )}
      </section>

      {/* Seccion 2 y 3: categoria y lugar */}
      <section className="metricas-section">
        <div className="metricas-header">
          <h2>Por categoria y lugar</h2>
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

        <p className="settings-hint">Este mes, por categoria y lugar.</p>
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

        <h3 style={{ marginTop: 24 }}>Evolucion de una categoria (12 meses)</h3>
        <div className="field" style={{ marginBottom: 12, maxWidth: 260 }}>
          <select
            value={categoriaSeleccionada ?? ""}
            onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
          >
            {categoriasTipo.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        {categoriaEvolData ? (
          <LineChart
            labels={categoriaEvolData.labels}
            series={[{ label: "Total", color: tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR, values: categoriaEvolData.valores }]}
          />
        ) : (
          <p className="chart-empty">Sin datos.</p>
        )}
        {mayorVariacion && (
          <p className="settings-hint">
            Categoria con mayor variacion mes a mes: <strong>{mayorVariacion.nombre}</strong>
          </p>
        )}
        {calidad && (
          <p className="settings-hint">
            {formatPct(calidad.porcentajeSinCategoria)} de los movimientos estan sin categoria.
          </p>
        )}

        <h3 style={{ marginTop: 24 }}>Distribucion de categorias por lugar (este mes)</h3>
        {lugarCategoria === null ? (
          <p>Cargando...</p>
        ) : (
          <Heatmap
            filas={lugarCategoriaFilas}
            columnas={lugarCategoriaColumnas}
            datos={lugarCategoria}
            colorBase={tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR}
          />
        )}

        {porcentajeEfectivo && (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <StatTile label="% en efectivo" value={formatPct(porcentajeEfectivo.pct)} sub="Historico, todos los gastos" />
            {porcentajeEfectivo.masUsado && (
              <StatTile
                label="Cuenta mas usada"
                value={porcentajeEfectivo.masUsado.lugar_nombre}
                sub={`${porcentajeEfectivo.masUsado.cantidad} movimientos`}
              />
            )}
          </div>
        )}
      </section>

      <section className="metricas-section">
        <h2>Evolucion del año en curso</h2>
        {porMes === null ? <p>Cargando...</p> : <MonthlyTrendChart datos={porMes} />}
      </section>

      {/* Seccion 4: comportamiento y habitos */}
      <section className="metricas-section">
        <h2>Comportamiento y habitos ({tipo === "ingreso" ? "ingresos" : "gastos"}, ultimos 12 meses)</h2>
        {habitos === null ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="stats-grid" style={{ marginTop: 16 }}>
              <StatTile label="Promedio por movimiento" value={formatMoney(habitos.promedio)} />
              <StatTile label="Mediana" value={formatMoney(habitos.mediana)} />
              <StatTile label="Maximo" value={formatMoney(habitos.max)} />
              <StatTile label="Minimo" value={formatMoney(habitos.min)} />
              <StatTile
                label="Frecuencia"
                value={habitos.frecuenciaSemanal ? `${habitos.frecuenciaSemanal.toFixed(1)}/semana` : "—"}
              />
              <StatTile
                label="Racha sin movimientos"
                value={`${habitos.rachaMaximaSinMovimientos} dias`}
              />
              <StatTile
                label="Gastos hormiga"
                value={formatPct(habitos.gastosHormiga.porcentaje)}
                sub={`${habitos.gastosHormiga.cantidad} mov. bajo ${formatMoney(habitos.gastosHormiga.umbral)}`}
              />
            </div>

            <div className="metricas-grid" style={{ marginTop: 24 }}>
              <div>
                <h3>Por dia de la semana</h3>
                <BarList
                  items={habitos.porDiaSemana.map((d) => ({ id: d.dia, label: d.dia, total: d.total }))}
                  colorFor={() => (tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR)}
                />
              </div>
              <div>
                <h3>Por dia del mes</h3>
                <VerticalBarChart
                  items={habitos.porDiaMes.map((d) => ({ label: String(d.dia), total: d.total }))}
                  color={tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Seccion 5: comparativas temporales */}
      <section className="metricas-section">
        <h2>Comparativas temporales ({tipo === "ingreso" ? "ingresos" : "gastos"})</h2>
        {comparativas ? (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <ComparativaCard
              titulo="Vs. mes anterior"
              actual={comparativas.actual[comparativas.campo]}
              referencia={comparativas.anterior[comparativas.campo]}
              favorableSiSube={tipo === "ingreso"}
            />
            {comparativas.mismoMesAnioAnterior && (
              <ComparativaCard
                titulo="Vs. mismo mes año anterior"
                actual={comparativas.actual[comparativas.campo]}
                referencia={comparativas.mismoMesAnioAnterior[comparativas.campo]}
                favorableSiSube={tipo === "ingreso"}
              />
            )}
          </div>
        ) : (
          <p>Cargando...</p>
        )}

        <h3 style={{ marginTop: 24 }}>Promedio movil (3 meses)</h3>
        {promedioMovilData && (
          <LineChart
            labels={promedioMovilData.labels}
            series={[
              { label: "Real", color: tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR, values: promedioMovilData.valores },
              { label: "Promedio movil 3m", color: "#52586a", values: promedioMovilData.ma, punteada: true },
            ]}
          />
        )}

        <h3 style={{ marginTop: 24 }}>Estacionalidad (promedio por mes calendario)</h3>
        {estacionalidad && (
          <VerticalBarChart items={estacionalidad} color={tipo === "ingreso" ? INGRESO_COLOR : EGRESO_COLOR} />
        )}
      </section>

      {/* Seccion 7: calidad de datos */}
      <section className="metricas-section">
        <h2>Calidad de datos</h2>
        {calidad === null ? (
          <p>Cargando...</p>
        ) : (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <StatTile label="Con descripcion" value={formatPct(calidad.porcentajeConDescripcion)} />
            <StatTile label="Sin categoria" value={formatPct(calidad.porcentajeSinCategoria)} />
            {calidad.lugarMenosUsado && (
              <StatTile
                label="Lugar menos usado"
                value={calidad.lugarMenosUsado.nombre}
                sub={`${calidad.lugarMenosUsado.cantidad} movimientos`}
              />
            )}
            {calidad.categoriaMenosUsada && (
              <StatTile
                label="Categoria menos usada"
                value={calidad.categoriaMenosUsada.nombre}
                sub={`${calidad.categoriaMenosUsada.cantidad} movimientos`}
              />
            )}
          </div>
        )}
      </section>

      {/* Seccion 8: metricas derivadas / avanzadas */}
      <section className="metricas-section">
        <h2>Metricas avanzadas (24 meses)</h2>
        {avanzadas === null ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="stats-grid" style={{ marginTop: 16 }}>
              <StatTile
                label="Gasto fijo vs variable"
                value={`${formatPct(
                  (avanzadas.ratioGastoFijoVariable.fijo /
                    (avanzadas.ratioGastoFijoVariable.fijo + avanzadas.ratioGastoFijoVariable.variable || 1)) *
                    100
                )} fijo`}
                sub={`${formatMoney(avanzadas.ratioGastoFijoVariable.fijo)} fijo / ${formatMoney(avanzadas.ratioGastoFijoVariable.variable)} variable`}
              />
              <StatTile
                label="Correlacion ingreso-gasto"
                value={
                  avanzadas.correlacionIngresoGasto === null
                    ? "—"
                    : avanzadas.correlacionIngresoGasto.toFixed(2)
                }
                sub="Pearson, mensual"
              />
            </div>

            <h3 style={{ marginTop: 24 }}>Diversificacion de categorias de gasto por mes</h3>
            <VerticalBarChart
              items={avanzadas.diversificacionCategorias.map((d) => ({ label: mesLabel(d.mes), total: d.categoriasDistintas }))}
              color={EGRESO_COLOR}
              formatValue={(v) => `${v} categorias`}
            />

            <h3 style={{ marginTop: 24 }}>Anomalias detectadas este mes</h3>
            {avanzadas.anomalias.length === 0 ? (
              <p className="chart-empty">Sin anomalias este mes.</p>
            ) : (
              <ul className="anomalias-list">
                {avanzadas.anomalias.map((a) => (
                  <li key={a.categoria_nombre}>
                    <strong>{a.categoria_nombre}</strong>: {formatMoney(a.mesActual)} este mes vs promedio historico de{" "}
                    {formatMoney(a.promedioHistorico)}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Metricas;
