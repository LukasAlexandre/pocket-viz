console.log("=== INÍCIO DO OPENFINANCE.TS ATUAL ===");

import express from "express";
import axios from "axios";
console.log('OpenFinance router loaded (arquivo openfinance.ts)');

const router = express.Router();
// Rota de teste para diagnóstico
router.get("/test", (_req, res) => {
  console.log("Handler /test foi chamado!");
  res.json({ ok: true });
});
const { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } = process.env as Record<string, string>;

// cache simples em memória (troque por Redis se quiser)
let apiKeyCache = { key: null as string | null, exp: 0 };
async function getApiKey() {
  const now = Date.now();
  if (apiKeyCache.key && apiKeyCache.exp > now) return apiKeyCache.key;
  const { data } = await axios.post("https://api.pluggy.ai/auth", {
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });
  apiKeyCache = { key: data.apiKey, exp: now + 1000 * 60 * 50 }; // ~50min
  return apiKeyCache.key;
}

router.get("/connect-token", async (_req, res) => {
  const apiKey = await getApiKey();
  const { data } = await axios.post(
    "https://api.pluggy.ai/connect_token",
    {},
    { headers: { "X-API-KEY": apiKey } }
  );
  res.json({ accessToken: data.accessToken });
});

router.get("/sync", async (req, res) => {
  const { itemId, from } = req.query;
  const apiKey = await getApiKey();
  const { data } = await axios.get(
    `https://api.pluggy.ai/transactions?itemId=${itemId}&from=${from || "2025-01-01"}`,
    { headers: { "X-API-KEY": apiKey } }
  );
  // TODO: mapear e salvar no seu banco (amount, date, description, category etc.)
  res.json({ imported: data.results?.length || 0, transactions: data.results });
});

export default router;
