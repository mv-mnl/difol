import { verificarToken } from "../auth.js";
import pool from "../db.js";

// Adjunta req.usuarioId (numero) a partir del Bearer token. Responde 401 si
// falta, es invalido, expiro, o el usuario ya no existe.
export default async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "no autenticado" });
    }

    let payload;
    try {
      payload = verificarToken(token);
    } catch {
      return res.status(401).json({ error: "token invalido o expirado" });
    }

    const [rows] = await pool.query("SELECT id FROM usuarios WHERE id = ?", [payload.id]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "usuario no encontrado" });
    }

    req.usuarioId = rows[0].id;
    next();
  } catch (err) {
    next(err);
  }
}
