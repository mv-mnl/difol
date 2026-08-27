import { Router } from "express";
import pool from "../db.js";
import { validarRangoFechas } from "../validation.js";

const router = Router();

const TIPOS = ["ingreso", "egreso"];
const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
// Heuristica para clasificar categorias de egreso como gasto fijo (sin tabla de presupuesto).
const PALABRAS_GASTO_FIJO = [
  "servicio", "renta", "alquiler", "hipoteca", "seguro", "internet",
  "luz", "agua", "gas", "prestamo", "suscripcion", "cable", "telefono",
];

function primerDiaMesAtras(n) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (n - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function listaMeses(n) {
  const meses = [];
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (n - 1));
  for (let i = 0; i < n; i++) {
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() + 1);
  }
  return meses;
}

function mediana(valores) {
  if (!valores.length) return 0;
  const ord = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(ord.length / 2);
  return ord.length % 2 === 0 ? (ord[mid - 1] + ord[mid]) / 2 : ord[mid];
}

function media(valores) {
  if (!valores.length) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function desviacionEstandar(valores) {
  if (valores.length < 2) return 0;
  const m = media(valores);
  const varianza = valores.reduce((acc, v) => acc + (v - m) ** 2, 0) / valores.length;
  return Math.sqrt(varianza);
}

function correlacionPearson(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const mx = media(xs);
  const my = media(ys);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? null : num / den;
}

function esCategoriaFija(nombre) {
  const n = nombre.toLowerCase();
  return PALABRAS_GASTO_FIJO.some((p) => n.includes(p));
}

router.get("/por-categoria", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const errorFechas = validarRangoFechas({ desde, hasta });
    if (errorFechas) {
      return res.status(400).json({ error: errorFechas });
    }
    const condiciones = ["m.usuario_id = ?", "m.tipo = ?"];
    const params = [req.usuarioId, tipo];
    if (desde) {
      condiciones.push("m.fecha >= ?");
      params.push(desde);
    }
    if (hasta) {
      condiciones.push("m.fecha <= ?");
      params.push(hasta);
    }
    const [rows] = await pool.query(
      `SELECT m.categoria_id, COALESCE(c.nombre, 'Sin categoria') AS categoria_nombre,
              SUM(m.monto) AS total, COUNT(*) AS cantidad
       FROM movimientos m
       LEFT JOIN categorias c ON c.id = m.categoria_id
       WHERE ${condiciones.join(" AND ")}
       GROUP BY m.categoria_id, categoria_nombre
       ORDER BY total DESC`,
      params
    );
    const totalGeneral = rows.reduce((acc, r) => acc + Number(r.total), 0);
    res.json(
      rows.map((r) => ({
        ...r,
        total: Number(r.total),
        cantidad: Number(r.cantidad),
        promedio: Number(r.total) / Number(r.cantidad),
        porcentaje: totalGeneral > 0 ? (Number(r.total) / totalGeneral) * 100 : 0,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/por-lugar", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    const errorFechas = validarRangoFechas({ desde, hasta });
    if (errorFechas) {
      return res.status(400).json({ error: errorFechas });
    }
    const condiciones = ["m.usuario_id = ?"];
    const params = [req.usuarioId];
    if (tipo) {
      if (!TIPOS.includes(tipo)) {
        return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
      }
      condiciones.push("m.tipo = ?");
      params.push(tipo);
    }
    if (desde) {
      condiciones.push("m.fecha >= ?");
      params.push(desde);
    }
    if (hasta) {
      condiciones.push("m.fecha <= ?");
      params.push(hasta);
    }
    const where = `WHERE ${condiciones.join(" AND ")}`;
    const [rows] = await pool.query(
      `SELECT m.lugar_id, l.nombre AS lugar_nombre, SUM(m.monto) AS total, COUNT(*) AS cantidad
       FROM movimientos m
       JOIN lugares l ON l.id = m.lugar_id
       ${where}
       GROUP BY m.lugar_id, lugar_nombre
       ORDER BY total DESC`,
      params
    );
    res.json(rows.map((r) => ({ ...r, total: Number(r.total), cantidad: Number(r.cantidad) })));
  } catch (err) {
    next(err);
  }
});

router.get("/por-mes", async (req, res, next) => {
  try {
    const anio = Number(req.query.anio) || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, tipo, SUM(monto) AS total
       FROM movimientos
       WHERE usuario_id = ? AND YEAR(fecha) = ?
       GROUP BY mes, tipo`,
      [req.usuarioId, anio]
    );

    const meses = Array.from({ length: 12 }, (_, i) => {
      const mm = String(i + 1).padStart(2, "0");
      return { mes: `${anio}-${mm}`, ingresos: 0, egresos: 0 };
    });
    rows.forEach((r) => {
      const m = meses.find((x) => x.mes === r.mes);
      if (!m) return;
      if (r.tipo === "ingreso") m.ingresos = Number(r.total);
      if (r.tipo === "egreso") m.egresos = Number(r.total);
    });

    res.json(meses);
  } catch (err) {
    next(err);
  }
});

// Seccion 1: flujo de dinero general para un periodo puntual.
router.get("/resumen", async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    const errorFechas = validarRangoFechas({ desde, hasta });
    if (errorFechas) {
      return res.status(400).json({ error: errorFechas });
    }
    const condiciones = ["usuario_id = ?"];
    const params = [req.usuarioId];
    if (desde) {
      condiciones.push("fecha >= ?");
      params.push(desde);
    }
    if (hasta) {
      condiciones.push("fecha <= ?");
      params.push(hasta);
    }
    const where = `WHERE ${condiciones.join(" AND ")}`;
    const [rows] = await pool.query(
      `SELECT tipo, SUM(monto) AS total, COUNT(*) AS cantidad FROM movimientos ${where} GROUP BY tipo`,
      params
    );
    const ingresos = Number(rows.find((r) => r.tipo === "ingreso")?.total || 0);
    const egresos = Number(rows.find((r) => r.tipo === "egreso")?.total || 0);
    const balance = ingresos - egresos;
    res.json({
      ingresos,
      egresos,
      balance,
      tasaAhorro: ingresos > 0 ? balance / ingresos : null,
      cantidadMovimientos: rows.reduce((acc, r) => acc + Number(r.cantidad), 0),
    });
  } catch (err) {
    next(err);
  }
});

// Serie mensual de los ultimos N meses (para tendencia, balance acumulado,
// promedio movil, comparativas y estacionalidad).
router.get("/serie-mensual", async (req, res, next) => {
  try {
    const meses = Math.min(Math.max(Number(req.query.meses) || 12, 1), 60);
    const inicio = primerDiaMesAtras(meses);
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, tipo, SUM(monto) AS total
       FROM movimientos
       WHERE usuario_id = ? AND fecha >= ?
       GROUP BY mes, tipo`,
      [req.usuarioId, inicio]
    );
    const serie = listaMeses(meses).map((mes) => ({ mes, ingresos: 0, egresos: 0 }));
    rows.forEach((r) => {
      const m = serie.find((x) => x.mes === r.mes);
      if (!m) return;
      if (r.tipo === "ingreso") m.ingresos = Number(r.total);
      if (r.tipo === "egreso") m.egresos = Number(r.total);
    });
    let acumulado = 0;
    serie.forEach((m) => {
      m.balance = m.ingresos - m.egresos;
      acumulado += m.balance;
      m.balanceAcumulado = acumulado;
    });
    res.json(serie);
  } catch (err) {
    next(err);
  }
});

// Proyeccion de gasto/ingreso del mes en curso segun el ritmo hasta hoy.
router.get("/proyeccion-mes", async (req, res, next) => {
  try {
    const hoy = new Date();
    const desde = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
    const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const diasTranscurridos = hoy.getDate();
    const [rows] = await pool.query(
      `SELECT tipo, SUM(monto) AS total FROM movimientos WHERE usuario_id = ? AND fecha >= ? GROUP BY tipo`,
      [req.usuarioId, desde]
    );
    const gastoHastaHoy = Number(rows.find((r) => r.tipo === "egreso")?.total || 0);
    const ingresoHastaHoy = Number(rows.find((r) => r.tipo === "ingreso")?.total || 0);
    const factor = diasEnMes / diasTranscurridos;
    res.json({
      mes: desde.slice(0, 7),
      diasTranscurridos,
      diasEnMes,
      gastoHastaHoy,
      ingresoHastaHoy,
      proyeccionGasto: gastoHastaHoy * factor,
      proyeccionIngreso: ingresoHastaHoy * factor,
    });
  } catch (err) {
    next(err);
  }
});

// Seccion 2: evolucion mensual por categoria (para grafico de una categoria,
// mayor variacion, diversificacion y deteccion de anomalias).
router.get("/categoria-evolucion", async (req, res, next) => {
  try {
    const { tipo } = req.query;
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const meses = Math.min(Math.max(Number(req.query.meses) || 12, 1), 60);
    const inicio = primerDiaMesAtras(meses);
    const [rows] = await pool.query(
      `SELECT m.categoria_id, COALESCE(c.nombre, 'Sin categoria') AS categoria_nombre,
              DATE_FORMAT(m.fecha, '%Y-%m') AS mes, SUM(m.monto) AS total
       FROM movimientos m
       LEFT JOIN categorias c ON c.id = m.categoria_id
       WHERE m.usuario_id = ? AND m.tipo = ? AND m.fecha >= ?
       GROUP BY m.categoria_id, categoria_nombre, mes`,
      [req.usuarioId, tipo, inicio]
    );
    const mesesLista = listaMeses(meses);
    const porCategoria = new Map();
    rows.forEach((r) => {
      const key = r.categoria_id ?? "sin-categoria";
      if (!porCategoria.has(key)) {
        porCategoria.set(key, {
          categoria_id: r.categoria_id,
          categoria_nombre: r.categoria_nombre,
          meses: new Map(mesesLista.map((m) => [m, 0])),
        });
      }
      porCategoria.get(key).meses.set(r.mes, Number(r.total));
    });
    const resultado = [...porCategoria.values()].map((c) => ({
      categoria_id: c.categoria_id,
      categoria_nombre: c.categoria_nombre,
      meses: mesesLista.map((mes) => ({ mes, total: c.meses.get(mes) })),
    }));
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// Seccion 3: distribucion de categorias por lugar (matriz lugar x categoria).
router.get("/lugar-categoria", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    const errorFechas = validarRangoFechas({ desde, hasta });
    if (errorFechas) {
      return res.status(400).json({ error: errorFechas });
    }
    const condiciones = ["m.usuario_id = ?"];
    const params = [req.usuarioId];
    if (tipo) {
      if (!TIPOS.includes(tipo)) {
        return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
      }
      condiciones.push("m.tipo = ?");
      params.push(tipo);
    }
    if (desde) {
      condiciones.push("m.fecha >= ?");
      params.push(desde);
    }
    if (hasta) {
      condiciones.push("m.fecha <= ?");
      params.push(hasta);
    }
    const where = `WHERE ${condiciones.join(" AND ")}`;
    const [rows] = await pool.query(
      `SELECT m.lugar_id, l.nombre AS lugar_nombre, m.categoria_id,
              COALESCE(c.nombre, 'Sin categoria') AS categoria_nombre, SUM(m.monto) AS total
       FROM movimientos m
       JOIN lugares l ON l.id = m.lugar_id
       LEFT JOIN categorias c ON c.id = m.categoria_id
       ${where}
       GROUP BY m.lugar_id, lugar_nombre, m.categoria_id, categoria_nombre`,
      params
    );
    res.json(rows.map((r) => ({ ...r, total: Number(r.total) })));
  } catch (err) {
    next(err);
  }
});

// Seccion 4: comportamiento y habitos.
router.get("/habitos", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const errorFechas = validarRangoFechas({ desde, hasta });
    if (errorFechas) {
      return res.status(400).json({ error: errorFechas });
    }
    const umbralHormiga = Number(req.query.umbralHormiga) || 5;
    const condiciones = ["usuario_id = ?", "tipo = ?"];
    const params = [req.usuarioId, tipo];
    if (desde) {
      condiciones.push("fecha >= ?");
      params.push(desde);
    }
    if (hasta) {
      condiciones.push("fecha <= ?");
      params.push(hasta);
    }
    const where = condiciones.join(" AND ");
    const [rows] = await pool.query(
      `SELECT monto, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha_str,
              DAYOFWEEK(fecha) AS dia_semana, DAY(fecha) AS dia_mes
       FROM movimientos WHERE ${where} ORDER BY fecha`,
      params
    );

    const montos = rows.map((r) => Number(r.monto));
    const fechas = [...new Set(rows.map((r) => r.fecha_str))].sort();

    let rachaMaxima = 0;
    if (fechas.length) {
      let racha = 0;
      let anterior = null;
      fechas.forEach((f) => {
        const actual = new Date(f);
        if (anterior !== null) {
          const gap = Math.round((actual - anterior) / 86400000) - 1;
          racha = Math.max(racha, gap);
        }
        anterior = actual;
      });
      rachaMaxima = racha;
    }

    const porDiaSemana = Array.from({ length: 7 }, (_, i) => ({ dia: DIAS_SEMANA[i], total: 0 }));
    rows.forEach((r) => {
      porDiaSemana[r.dia_semana - 1].total += Number(r.monto);
    });

    const porDiaMes = Array.from({ length: 31 }, (_, i) => ({ dia: i + 1, total: 0 }));
    rows.forEach((r) => {
      porDiaMes[r.dia_mes - 1].total += Number(r.monto);
    });

    const totalGeneral = montos.reduce((a, b) => a + b, 0);
    const hormiga = montos.filter((m) => m < umbralHormiga);
    const totalHormiga = hormiga.reduce((a, b) => a + b, 0);

    const dias = desde && hasta ? (new Date(hasta) - new Date(desde)) / 86400000 + 1 : null;

    res.json({
      cantidad: montos.length,
      promedio: media(montos),
      mediana: mediana(montos),
      max: montos.length ? Math.max(...montos) : 0,
      min: montos.length ? Math.min(...montos) : 0,
      frecuenciaSemanal: dias ? montos.length / (dias / 7) : null,
      porDiaSemana,
      porDiaMes,
      rachaMaximaSinMovimientos: rachaMaxima,
      gastosHormiga: {
        umbral: umbralHormiga,
        cantidad: hormiga.length,
        total: totalHormiga,
        porcentaje: totalGeneral > 0 ? (totalHormiga / totalGeneral) * 100 : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Seccion 7: calidad de datos.
router.get("/calidad", async (req, res, next) => {
  try {
    const [[totales]] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN descripcion IS NOT NULL AND descripcion <> '' THEN 1 ELSE 0 END) AS conDescripcion,
              SUM(CASE WHEN categoria_id IS NULL THEN 1 ELSE 0 END) AS sinCategoria
       FROM movimientos
       WHERE usuario_id = ?`,
      [req.usuarioId]
    );
    const total = Number(totales.total);
    const [lugares] = await pool.query(
      `SELECT l.id, l.nombre, COUNT(m.id) AS cantidad
       FROM lugares l LEFT JOIN movimientos m ON m.lugar_id = l.id
       WHERE l.usuario_id = ?
       GROUP BY l.id, l.nombre ORDER BY cantidad ASC LIMIT 1`,
      [req.usuarioId]
    );
    const [categorias] = await pool.query(
      `SELECT c.id, c.nombre, COUNT(m.id) AS cantidad
       FROM categorias c LEFT JOIN movimientos m ON m.categoria_id = c.id
       WHERE c.usuario_id = ?
       GROUP BY c.id, c.nombre ORDER BY cantidad ASC LIMIT 1`,
      [req.usuarioId]
    );
    res.json({
      totalMovimientos: total,
      porcentajeConDescripcion: total > 0 ? (Number(totales.conDescripcion) / total) * 100 : 0,
      porcentajeSinCategoria: total > 0 ? (Number(totales.sinCategoria) / total) * 100 : 0,
      lugarMenosUsado: lugares[0]
        ? { id: lugares[0].id, nombre: lugares[0].nombre, cantidad: Number(lugares[0].cantidad) }
        : null,
      categoriaMenosUsada: categorias[0]
        ? { id: categorias[0].id, nombre: categorias[0].nombre, cantidad: Number(categorias[0].cantidad) }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

// Seccion 8: metricas derivadas / avanzadas.
router.get("/avanzadas", async (req, res, next) => {
  try {
    const meses = Math.min(Math.max(Number(req.query.meses) || 12, 1), 60);
    const inicio = primerDiaMesAtras(meses);
    const mesesLista = listaMeses(meses);

    const [rows] = await pool.query(
      `SELECT m.tipo, m.categoria_id, COALESCE(c.nombre, 'Sin categoria') AS categoria_nombre,
              DATE_FORMAT(m.fecha, '%Y-%m') AS mes, SUM(m.monto) AS total
       FROM movimientos m
       LEFT JOIN categorias c ON c.id = m.categoria_id
       WHERE m.usuario_id = ? AND m.fecha >= ?
       GROUP BY m.tipo, m.categoria_id, categoria_nombre, mes`,
      [req.usuarioId, inicio]
    );

    // Ratio gasto fijo vs variable (solo egresos, clasificado por nombre de categoria).
    let fijo = 0;
    let variable = 0;
    rows
      .filter((r) => r.tipo === "egreso")
      .forEach((r) => {
        if (esCategoriaFija(r.categoria_nombre)) fijo += Number(r.total);
        else variable += Number(r.total);
      });

    // Correlacion entre ingreso y gasto mensual.
    const totalesPorMes = new Map(mesesLista.map((m) => [m, { ingreso: 0, egreso: 0 }]));
    rows.forEach((r) => {
      const bucket = totalesPorMes.get(r.mes);
      if (!bucket) return;
      bucket[r.tipo] += Number(r.total);
    });
    const ingresosSerie = mesesLista.map((m) => totalesPorMes.get(m).ingreso);
    const egresosSerie = mesesLista.map((m) => totalesPorMes.get(m).egreso);
    const correlacionIngresoGasto = correlacionPearson(ingresosSerie, egresosSerie);

    // Diversificacion: cuantas categorias de egreso distintas se usaron cada mes.
    const categoriasPorMes = new Map(mesesLista.map((m) => [m, new Set()]));
    rows
      .filter((r) => r.tipo === "egreso")
      .forEach((r) => {
        if (Number(r.total) > 0) categoriasPorMes.get(r.mes)?.add(r.categoria_id ?? "sin-categoria");
      });
    const diversificacion = mesesLista.map((m) => ({
      mes: m,
      categoriasDistintas: categoriasPorMes.get(m).size,
    }));

    // Anomalias: gasto del mes actual por categoria muy por encima del promedio historico.
    const mesActual = mesesLista[mesesLista.length - 1];
    const historico = new Map();
    rows
      .filter((r) => r.tipo === "egreso" && r.mes !== mesActual)
      .forEach((r) => {
        const key = r.categoria_id ?? "sin-categoria";
        if (!historico.has(key)) {
          historico.set(key, { nombre: r.categoria_nombre, valores: [] });
        }
        historico.get(key).valores.push(Number(r.total));
      });
    const actual = new Map();
    rows
      .filter((r) => r.tipo === "egreso" && r.mes === mesActual)
      .forEach((r) => actual.set(r.categoria_id ?? "sin-categoria", Number(r.total)));

    const anomalias = [];
    historico.forEach((info, key) => {
      const valorActual = actual.get(key) || 0;
      const m = media(info.valores);
      const desv = desviacionEstandar(info.valores);
      if (m > 0 && desv > 0 && valorActual > m + 1.5 * desv) {
        anomalias.push({
          categoria_nombre: info.nombre,
          mesActual: valorActual,
          promedioHistorico: m,
          desviacion: desv,
        });
      }
    });

    res.json({
      ratioGastoFijoVariable: { fijo, variable },
      correlacionIngresoGasto,
      diversificacionCategorias: diversificacion,
      anomalias,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
