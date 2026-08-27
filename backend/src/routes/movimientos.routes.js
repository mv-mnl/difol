import { Router } from "express";
import pool from "../db.js";
import { esFechaValida, validarRangoFechas } from "../validation.js";

const router = Router();

const TIPOS = ["ingreso", "egreso"];

async function validarMovimiento(body, usuarioId) {
  const { tipo, monto, fecha, lugar_id, categoria_id } = body;

  if (!TIPOS.includes(tipo)) {
    return "tipo debe ser 'ingreso' o 'egreso'";
  }
  if (typeof monto !== "number" || monto <= 0) {
    return "monto debe ser un numero positivo";
  }
  if (!fecha) {
    return "fecha es obligatoria";
  }
  if (!esFechaValida(fecha)) {
    return "fecha debe tener el formato YYYY-MM-DD";
  }
  if (!lugar_id) {
    return "lugar_id es obligatorio";
  }

  const [lugarRows] = await pool.query(
    "SELECT id FROM lugares WHERE id = ? AND usuario_id = ?",
    [lugar_id, usuarioId]
  );
  if (lugarRows.length === 0) {
    return "el lugar indicado no existe";
  }

  if (categoria_id !== undefined && categoria_id !== null) {
    const [catRows] = await pool.query(
      "SELECT id FROM categorias WHERE id = ? AND tipo = ? AND usuario_id = ?",
      [categoria_id, tipo, usuarioId]
    );
    if (catRows.length === 0) {
      return "la categoria indicada no existe o no corresponde al tipo del movimiento";
    }
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const { tipo, desde, hasta, categoria_id, lugar_id } = req.query;
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
    if (categoria_id) {
      condiciones.push("m.categoria_id = ?");
      params.push(categoria_id);
    }
    if (lugar_id) {
      condiciones.push("m.lugar_id = ?");
      params.push(lugar_id);
    }

    const where = `WHERE ${condiciones.join(" AND ")}`;
    const [rows] = await pool.query(
      `SELECT m.*, c.nombre AS categoria_nombre, l.nombre AS lugar_nombre
       FROM movimientos m
       LEFT JOIN categorias c ON c.id = m.categoria_id
       JOIN lugares l ON l.id = m.lugar_id
       ${where}
       ORDER BY m.fecha DESC, m.id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const error = await validarMovimiento(req.body, req.usuarioId);
    if (error) {
      return res.status(400).json({ error });
    }
    const { tipo, monto, fecha, descripcion, categoria_id, lugar_id } = req.body;
    const [result] = await pool.query(
      `INSERT INTO movimientos (usuario_id, tipo, monto, fecha, descripcion, categoria_id, lugar_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.usuarioId, tipo, monto, fecha, descripcion || null, categoria_id || null, lugar_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const error = await validarMovimiento(req.body, req.usuarioId);
    if (error) {
      return res.status(400).json({ error });
    }
    const { tipo, monto, fecha, descripcion, categoria_id, lugar_id } = req.body;
    const [result] = await pool.query(
      `UPDATE movimientos
       SET tipo = ?, monto = ?, fecha = ?, descripcion = ?, categoria_id = ?, lugar_id = ?
       WHERE id = ? AND usuario_id = ?`,
      [tipo, monto, fecha, descripcion || null, categoria_id || null, lugar_id, req.params.id, req.usuarioId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "movimiento no encontrado" });
    }
    res.json({ id: Number(req.params.id), ...req.body });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM movimientos WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuarioId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "movimiento no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
