import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lugares ORDER BY nombre");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    const [result] = await pool.query(
      "INSERT INTO lugares (nombre) VALUES (?)",
      [nombre.trim()]
    );
    res.status(201).json({ id: result.insertId, nombre: nombre.trim() });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ya existe un lugar con ese nombre" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    const [result] = await pool.query(
      "UPDATE lugares SET nombre = ? WHERE id = ?",
      [nombre.trim(), req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "lugar no encontrado" });
    }
    res.json({ id: Number(req.params.id), nombre: nombre.trim() });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ya existe un lugar con ese nombre" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM lugares WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "lugar no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .json({ error: "no se puede eliminar: hay movimientos que usan este lugar" });
    }
    next(err);
  }
});

export default router;
