import { Router } from "express";
import pool from "../db.js";

const router = Router();

const TIPOS = ["ingreso", "egreso"];

router.get("/por-categoria", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const condiciones = ["m.tipo = ?"];
    const params = [tipo];
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
              SUM(m.monto) AS total
       FROM movimientos m
       LEFT JOIN categorias c ON c.id = m.categoria_id
       WHERE ${condiciones.join(" AND ")}
       GROUP BY m.categoria_id, categoria_nombre
       ORDER BY total DESC`,
      params
    );
    res.json(rows.map((r) => ({ ...r, total: Number(r.total) })));
  } catch (err) {
    next(err);
  }
});

router.get("/por-lugar", async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    const condiciones = [];
    const params = [];
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
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT m.lugar_id, l.nombre AS lugar_nombre, SUM(m.monto) AS total
       FROM movimientos m
       JOIN lugares l ON l.id = m.lugar_id
       ${where}
       GROUP BY m.lugar_id, lugar_nombre
       ORDER BY total DESC`,
      params
    );
    res.json(rows.map((r) => ({ ...r, total: Number(r.total) })));
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
       WHERE YEAR(fecha) = ?
       GROUP BY mes, tipo`,
      [anio]
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

export default router;
