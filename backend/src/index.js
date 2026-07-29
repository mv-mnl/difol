import express from "express";
import cors from "cors";
import "dotenv/config";
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

app.use("/api/lugares", lugaresRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/movimientos", movimientosRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/metricas", metricasRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`difol-backend escuchando en puerto ${PORT}`);
});
