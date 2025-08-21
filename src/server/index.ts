// src/server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import openFinanceRouter from "./routes/openfinance.js";

const app = express();

// Libera o frontend local
const FRONT_ORIGINS = (process.env.FRONT_ORIGINS || "http://localhost:8080")
  .split(",")
  .map(s => s.trim());

app.use(cors({ origin: FRONT_ORIGINS, credentials: true }));
app.use(express.json());

// Sanity
app.get("/api/ping", (_req, res) => res.json({ pong: true }));

// Suas rotas de Open Finance
app.use("/api/openfinance", openFinanceRouter);

// 404 padrão
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada (debug)" }));

const PORT = Number(process.env.PORT || 3333);
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
