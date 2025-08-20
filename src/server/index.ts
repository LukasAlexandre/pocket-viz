console.log("=== INÍCIO DO INDEX.TS ATUAL ===");

import "dotenv/config";
import express from "express";
import cors from "cors";
import openFinanceRouter from "./openfinance.js";


const app = express();
const PORT = process.env.PORT || 3333;


app.use(cors());
app.use(express.json());

// Rotas Open Finance
app.use("/api/openfinance", openFinanceRouter);
console.log('OpenFinance router attached');

// Rota de debug direta
app.get("/api/debug", (_req, res) => {
  res.json({ ok: true, msg: "rota debug ativa" });
});

app.get("/api/ping", (_req, res) => res.send("pong"));

// Middleware 404 customizado para debug (sempre por último)
app.use((req, res) => {
  console.log("404 handler: URL não encontrada:", req.originalUrl);
  res.status(404).json({ error: "Rota não encontrada (debug)" });
});

app.get("/api/teste-direto", (_req, res) => {
  res.json({ ok: true });
});
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
