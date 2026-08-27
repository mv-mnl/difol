import { Router } from "express";
import pool from "../db.js";
import { validarRangoFechas } from "../validation.js";

const router = Router();

router.get("/", async (req, res, next) => {
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
      `SELECT tipo, COALESCE(SUM(monto), 0) AS total
       FROM movimientos
       ${where}
       GROUP BY tipo`,
      params
    );

    const ingresos = Number(rows.find((r) => r.tipo === "ingreso")?.total || 0);
    const egresos = Number(rows.find((r) => r.tipo === "egreso")?.total || 0);

    res.json({ ingresos, egresos, balance: ingresos - egresos });
  } catch (err) {
    next(err);
  }
});

export default router;
