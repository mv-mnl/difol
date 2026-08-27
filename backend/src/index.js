import express from "express";
import cors from "cors";
import "dotenv/config";
import { ejecutarMigraciones } from "./migrate.js";
import requireAuth from "./middleware/requireAuth.js";
import authRouter from "./routes/auth.routes.js";
import lugaresRouter from "./routes/lugares.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";
import movimientosRouter from "./routes/movimientos.routes.js";
import balanceRouter from "./routes/balance.routes.js";
import metricasRouter from "./routes/metricas.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

// Todo lo demas requiere estar autenticado: cada lugar/categoria/movimiento
// pertenece a un usuario.
app.use("/api/lugares", requireAuth, lugaresRouter);
app.use("/api/categorias", requireAuth, categoriasRouter);
app.use("/api/movimientos", requireAuth, movimientosRouter);
app.use("/api/balance", requireAuth, balanceRouter);
app.use("/api/metricas", requireAuth, metricasRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "error interno del servidor" });
});

const PORT = process.env.PORT || 4000;

ejecutarMigraciones()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`difol-backend escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("no se pudieron aplicar las migraciones, abortando arranque:", err);
    process.exit(1);
  });
