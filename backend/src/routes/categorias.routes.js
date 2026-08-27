import { Router } from "express";
import pool from "../db.js";

const router = Router();

const TIPOS = ["ingreso", "egreso"];

router.get("/", async (req, res, next) => {
  try {
    const { tipo } = req.query;
    if (tipo && !TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const [rows] = tipo
      ? await pool.query(
          "SELECT * FROM categorias WHERE usuario_id = ? AND tipo = ? ORDER BY nombre",
          [req.usuarioId, tipo]
        )
      : await pool.query(
          "SELECT * FROM categorias WHERE usuario_id = ? ORDER BY tipo, nombre",
          [req.usuarioId]
        );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { nombre, tipo } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const [result] = await pool.query(
      "INSERT INTO categorias (usuario_id, nombre, tipo) VALUES (?, ?, ?)",
      [req.usuarioId, nombre.trim(), tipo]
    );
    res.status(201).json({ id: result.insertId, nombre: nombre.trim(), tipo });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "ya existe una categoria con ese nombre y tipo" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { nombre, tipo } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }
    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ error: "tipo debe ser 'ingreso' o 'egreso'" });
    }
    const [result] = await pool.query(
      "UPDATE categorias SET nombre = ?, tipo = ? WHERE id = ? AND usuario_id = ?",
      [nombre.trim(), tipo, req.params.id, req.usuarioId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "categoria no encontrada" });
    }
    res.json({ id: Number(req.params.id), nombre: nombre.trim(), tipo });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "ya existe una categoria con ese nombre y tipo" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM categorias WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuarioId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "categoria no encontrada" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
