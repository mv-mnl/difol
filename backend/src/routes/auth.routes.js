import { Router } from "express";
import pool from "../db.js";
import { hashPassword, compararPassword, firmarToken } from "../auth.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

function esEmailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function usuarioPublico(usuario) {
  return { id: usuario.id, email: usuario.email, nombre: usuario.nombre };
}

// Los lugares/categorias/movimientos creados antes de que existiera el login
// quedan con usuario_id NULL (ver migracion 002). El primer usuario que se
// registra en el sistema los reclama automaticamente.
async function reclamarDatosHuerfanosSiEsPrimerUsuario(conn, usuarioId) {
  const [[{ total }]] = await conn.query("SELECT COUNT(*) AS total FROM usuarios");
  if (total !== 1) return;

  for (const tabla of ["lugares", "categorias", "movimientos"]) {
    await conn.query(`UPDATE ${tabla} SET usuario_id = ? WHERE usuario_id IS NULL`, [usuarioId]);
  }
}

router.post("/register", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { email, password, nombre } = req.body;
    if (!esEmailValido(email)) {
      return res.status(400).json({ error: "email invalido" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "la contrasena debe tener al menos 8 caracteres" });
    }
    if (typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }

    const passwordHash = await hashPassword(password);

    await conn.beginTransaction();
    let usuarioId;
    try {
      const [result] = await conn.query(
        "INSERT INTO usuarios (email, password_hash, nombre) VALUES (?, ?, ?)",
        [email.trim().toLowerCase(), passwordHash, nombre.trim()]
      );
      usuarioId = result.insertId;
      await reclamarDatosHuerfanosSiEsPrimerUsuario(conn, usuarioId);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    }

    const usuario = { id: usuarioId, email: email.trim().toLowerCase(), nombre: nombre.trim() };
    const token = firmarToken(usuario);
    res.status(201).json({ token, usuario: usuarioPublico(usuario) });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ya existe una cuenta con ese email" });
    }
    next(err);
  } finally {
    conn.release();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!esEmailValido(email) || typeof password !== "string") {
      return res.status(400).json({ error: "email o contrasena invalidos" });
    }

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ error: "credenciales invalidas" });
    }

    const ok = await compararPassword(password, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "credenciales invalidas" });
    }

    const token = firmarToken(usuario);
    res.json({ token, usuario: usuarioPublico(usuario) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [req.usuarioId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }
    res.json(usuarioPublico(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { nombre, email, password_actual, password_nueva } = req.body;
    if (!esEmailValido(email)) {
      return res.status(400).json({ error: "email invalido" });
    }
    if (typeof nombre !== "string" || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es obligatorio" });
    }

    const cambiaPassword = Boolean(password_nueva);
    if (cambiaPassword) {
      if (typeof password_nueva !== "string" || password_nueva.length < 8) {
        return res.status(400).json({ error: "la nueva contrasena debe tener al menos 8 caracteres" });
      }
      if (typeof password_actual !== "string" || !password_actual) {
        return res.status(400).json({ error: "indica tu contrasena actual para cambiarla" });
      }
    }

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [req.usuarioId]);
    const usuario = rows[0];
    if (!usuario) {
      return res.status(404).json({ error: "usuario no encontrado" });
    }

    let passwordHash = usuario.password_hash;
    if (cambiaPassword) {
      const ok = await compararPassword(password_actual, usuario.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "la contrasena actual es incorrecta" });
      }
      passwordHash = await hashPassword(password_nueva);
    }

    await pool.query(
      "UPDATE usuarios SET nombre = ?, email = ?, password_hash = ? WHERE id = ?",
      [nombre.trim(), email.trim().toLowerCase(), passwordHash, req.usuarioId]
    );

    res.json(usuarioPublico({ id: req.usuarioId, nombre: nombre.trim(), email: email.trim().toLowerCase() }));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "ya existe una cuenta con ese email" });
    }
    next(err);
  }
});

export default router;
