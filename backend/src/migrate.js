import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pool from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "../database/migrations");

// Separa un archivo .sql en sentencias individuales. Quita primero las lineas
// de comentario (pueden traer ";" y romper el split). Suficiente para
// nuestras migraciones (sin ; dentro de strings).
function splitStatements(sql) {
  const sinComentarios = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  return sinComentarios
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function ejecutarMigraciones() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        nombre VARCHAR(255) PRIMARY KEY,
        aplicada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const archivos = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const [aplicadas] = await conn.query("SELECT nombre FROM schema_migrations");
    const yaAplicadas = new Set(aplicadas.map((r) => r.nombre));

    for (const archivo of archivos) {
      if (yaAplicadas.has(archivo)) continue;

      const sql = readFileSync(path.join(MIGRATIONS_DIR, archivo), "utf8");
      const statements = splitStatements(sql);

      console.log(`[migrate] aplicando ${archivo}...`);
      await conn.beginTransaction();
      try {
        for (const statement of statements) {
          await conn.query(statement);
        }
        await conn.query("INSERT INTO schema_migrations (nombre) VALUES (?)", [archivo]);
        await conn.commit();
        console.log(`[migrate] ${archivo} aplicada`);
      } catch (err) {
        await conn.rollback();
        throw new Error(`[migrate] fallo aplicando ${archivo}: ${err.message}`);
      }
    }
  } finally {
    conn.release();
  }
}
