import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "difol",
  password: process.env.DB_PASSWORD || "difol",
  database: process.env.DB_NAME || "difol",
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
