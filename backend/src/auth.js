import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// En dev cae a un secreto fijo para no romper `docker compose up` sin .env;
// en produccion es obligatorio definir JWT_SECRET (ver docker-compose.prod.yml).
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar-en-produccion";
if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET no definido, usando secreto de desarrollo. No usar en produccion.");
}

const JWT_EXPIRES_IN = "30d";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function firmarToken(usuario) {
  return jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
