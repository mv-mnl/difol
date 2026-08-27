// Genera ~24 meses de movimientos sinteticos para poder ver las metricas con datos reales.
// Uso: docker compose exec backend node scripts/seed-demo.js <email-del-usuario>
import pool from "../src/db.js";

const MESES_HISTORIA = 24;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function chance(p) {
  return Math.random() < p;
}

function diasEnMes(year, month) {
  return new Date(year, month, 0).getDate();
}

function fechaStr(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function idsPorNombre(tabla, usuarioId, columnaExtra) {
  const [rows] = await pool.query(
    `SELECT id, nombre${columnaExtra ? `, ${columnaExtra}` : ""} FROM ${tabla} WHERE usuario_id = ?`,
    [usuarioId]
  );
  return rows;
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Uso: node scripts/seed-demo.js <email-del-usuario>");
  }
  const [[usuario]] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
  if (!usuario) {
    throw new Error(`No existe un usuario con email ${email}`);
  }
  const usuarioId = usuario.id;

  const categorias = await idsPorNombre("categorias", usuarioId, "tipo");
  const lugares = await idsPorNombre("lugares", usuarioId);

  const cat = (nombre) => categorias.find((c) => c.nombre === nombre)?.id;
  const lug = (nombre) => lugares.find((l) => l.nombre === nombre)?.id;

  const CAT = {
    sueldo: cat("Sueldo"),
    otrosIngresos: cat("Otros ingresos"),
    comida: cat("Comida"),
    transporte: cat("Transporte"),
    servicios: cat("Servicios"),
    otrosGastos: cat("Otros gastos"),
  };
  const LUG = { efectivo: lug("Efectivo"), banco: lug("Banco") };

  if (Object.values(CAT).some((v) => !v) || Object.values(LUG).some((v) => !v)) {
    throw new Error("Faltan categorias/lugares esperados en la base (correr init.sql primero)");
  }

  const hoy = new Date();
  const movimientos = [];

  for (let m = MESES_HISTORIA - 1; m >= 0; m--) {
    const fechaRef = new Date(hoy.getFullYear(), hoy.getMonth() - m, 1);
    const year = fechaRef.getFullYear();
    const month = fechaRef.getMonth() + 1;
    const esMesActual = m === 0;
    const maxDia = esMesActual ? hoy.getDate() : diasEnMes(year, month);
    const indiceMes = MESES_HISTORIA - 1 - m; // 0 = mes mas antiguo
    const tendencia = 1 + indiceMes * 0.004;
    const boostTemporada = month === 12 ? 1.35 : month === 11 ? 1.1 : 1;

    // Ingreso fijo: sueldo el dia 1
    movimientos.push({
      tipo: "ingreso",
      monto: +(1200 * tendencia + randFloat(-30, 30)).toFixed(2),
      fecha: fechaStr(year, month, 1),
      descripcion: chance(0.9) ? "Pago de planilla" : null,
      categoria_id: CAT.sueldo,
      lugar_id: LUG.banco,
    });

    // Otros ingresos ocasionales
    for (let i = 0; i < randInt(0, 2); i++) {
      movimientos.push({
        tipo: "ingreso",
        monto: +(randFloat(20, 150) * tendencia).toFixed(2),
        fecha: fechaStr(year, month, randInt(1, maxDia)),
        descripcion: chance(0.6) ? pick(["Reembolso", "Bono", "Venta"]) : null,
        categoria_id: chance(0.9) ? CAT.otrosIngresos : null,
        lugar_id: chance(0.7) ? LUG.banco : LUG.efectivo,
      });
    }

    // Servicios (gasto fijo), dias tempranos del mes
    const servicios = [
      { dia: 5, base: 35, label: "Internet" },
      { dia: 10, base: 45, label: "Energia electrica" },
      { dia: 15, base: 20, label: "Agua" },
    ];
    servicios.forEach((s) => {
      if (s.dia > maxDia) return;
      movimientos.push({
        tipo: "egreso",
        monto: +(s.base * tendencia + randFloat(-3, 3)).toFixed(2),
        fecha: fechaStr(year, month, s.dia),
        descripcion: chance(0.85) ? s.label : null,
        categoria_id: CAT.servicios,
        lugar_id: chance(0.9) ? LUG.banco : LUG.efectivo,
      });
    });

    // Comida: muchas transacciones pequenas, buena parte "gasto hormiga"
    const countComida = randInt(12, 22);
    for (let i = 0; i < countComida; i++) {
      movimientos.push({
        tipo: "egreso",
        monto: +(randFloat(3, 28) * tendencia * boostTemporada).toFixed(2),
        fecha: fechaStr(year, month, randInt(1, maxDia)),
        descripcion: chance(0.7) ? pick(["Almuerzo", "Cena", "Supermercado", "Cafe", "Snack"]) : null,
        categoria_id: chance(0.9) ? CAT.comida : null,
        lugar_id: chance(0.6) ? LUG.efectivo : LUG.banco,
      });
    }

    // Transporte: frecuente, mayormente efectivo
    const countTransporte = randInt(8, 16);
    for (let i = 0; i < countTransporte; i++) {
      movimientos.push({
        tipo: "egreso",
        monto: +(randFloat(2, 15) * tendencia).toFixed(2),
        fecha: fechaStr(year, month, randInt(1, maxDia)),
        descripcion: chance(0.5) ? pick(["Bus", "Gasolina", "Uber"]) : null,
        categoria_id: chance(0.92) ? CAT.transporte : null,
        lugar_id: chance(0.75) ? LUG.efectivo : LUG.banco,
      });
    }

    // Otros gastos: irregulares, mas grandes; con boost fuerte en diciembre
    const countOtros = indiceMes === 6 ? 1 : randInt(2, 6); // mes 6 (~18 meses atras) sirve para probar anomalias
    for (let i = 0; i < countOtros; i++) {
      const esAnomalo = indiceMes === 6;
      movimientos.push({
        tipo: "egreso",
        monto: esAnomalo
          ? +(randFloat(450, 600)).toFixed(2)
          : +(randFloat(20, 160) * tendencia * boostTemporada).toFixed(2),
        fecha: fechaStr(year, month, randInt(1, maxDia)),
        descripcion: chance(0.6) ? pick(["Ropa", "Regalo", "Reparacion", "Salud"]) : null,
        categoria_id: chance(0.85) ? CAT.otrosGastos : null,
        lugar_id: chance(0.5) ? LUG.banco : LUG.efectivo,
      });
    }
  }

  await pool.query("DELETE FROM movimientos WHERE usuario_id = ?", [usuarioId]);

  const columnas = ["usuario_id", "tipo", "monto", "fecha", "descripcion", "categoria_id", "lugar_id"];
  const batchSize = 200;
  for (let i = 0; i < movimientos.length; i += batchSize) {
    const lote = movimientos.slice(i, i + batchSize);
    const placeholders = lote.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
    const valores = lote.flatMap((mv) =>
      columnas.map((c) => (c === "usuario_id" ? usuarioId : mv[c]))
    );
    await pool.query(
      `INSERT INTO movimientos (${columnas.join(", ")}) VALUES ${placeholders}`,
      valores
    );
  }

  console.log(`Insertados ${movimientos.length} movimientos sinteticos (${MESES_HISTORIA} meses).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
