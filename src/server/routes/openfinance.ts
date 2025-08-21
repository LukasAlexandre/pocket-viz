// src/server/routes/openfinance.ts
import express, { type Request, type Response } from "express";
import axios from "axios";
import { pool } from "../db.js";

const router = express.Router();

const { PLUGGY_CLIENT_ID, PLUGGY_CLIENT_SECRET } =
  process.env as Record<string, string>;

/* ========================================================================== */
/* 0) SDK do Pluggy via BACKEND (evita CORB/ORB e bloqueadores de navegador)  */
/* ========================================================================== */

const PLUGGY_SDK_CANDIDATES = [
  "https://connect.pluggy.ai/sdk/v2/pluggy-connect.js",
  "https://connect.pluggy.ai/sdk/v1/pluggy-connect.js",
  "https://connect.pluggy.ai/pluggy-connect.js",
  "https://cdn.pluggy.ai/sdk/v2/pluggy-connect.js",
  "https://cdn.pluggy.ai/sdk/pluggy-connect.js",
];

// Cache simples do JS por 1h
let sdkCache: { js?: string; exp: number } = { js: undefined, exp: 0 };

router.get("/sdk/pluggy-connect.js", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (sdkCache.js && sdkCache.exp > now) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      return res.status(200).send(sdkCache.js);
    }

    const commonHeaders = {
      Accept: "application/javascript, text/javascript;q=0.9, */*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
      Referer: "https://connect.pluggy.ai/",
    } as const;

    let jsBody: string | null = null;

    for (const url of PLUGGY_SDK_CANDIDATES) {
      try {
        const { data, headers } = await axios.get<string>(url, {
          responseType: "text",
          timeout: 15000,
          maxRedirects: 5,
          headers: commonHeaders,
        });

        const ct = String(headers["content-type"] || "").toLowerCase();
        const looksHtml =
          ct.includes("text/html") ||
          /^\s*<!doctype html/i.test(data) ||
          /^\s*<html/i.test(data);

        if (!looksHtml) {
          jsBody = data;
          break;
        }
      } catch {
        // tenta próximo candidato
      }
    }

    if (!jsBody) {
      return res
        .status(502)
        .type("text/plain")
        .send(
          "Bad gateway: could not fetch Pluggy SDK as JavaScript (all sources returned HTML or failed)."
        );
    }

    sdkCache = { js: jsBody, exp: Date.now() + 3600_000 };

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    return res.status(200).send(jsBody);
  } catch (err: any) {
    console.error("GET /sdk/pluggy-connect.js failed:", err?.message || err);
    return res
      .status(502)
      .type("text/plain")
      .send("// Failed to fetch Pluggy SDK. Try again later.");
  }
});

/* ========================================================================== */
/* 1) Cache simples do apiKey do Pluggy (≈50 min)                              */
/* ========================================================================== */

let apiKeyCache: { key: string | null; exp: number } = { key: null, exp: 0 };

async function getApiKey() {
  if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
    throw new Error("Faltam PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET");
  }
  const now = Date.now();
  if (apiKeyCache.key && apiKeyCache.exp > now) return apiKeyCache.key!;
  const { data } = await axios.post("https://api.pluggy.ai/auth", {
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });
  apiKeyCache = { key: data.apiKey, exp: now + 50 * 60 * 1000 };
  return apiKeyCache.key!;
}

/* ========================================================================== */
/* 2) Sanity                                                                   */
/* ========================================================================== */

router.get("/ping", (_req, res) => res.json({ pong: true }));

/* ========================================================================== */
/* 3) Token do Pluggy Connect                                                  */
/* ========================================================================== */

router.get("/connect-token", async (_req, res) => {
  try {
    const apiKey = await getApiKey();
    const { data } = await axios.post(
      "https://api.pluggy.ai/connect_token",
      {},
      { headers: { "X-API-KEY": apiKey } }
    );
    res.json({ accessToken: data.accessToken });
  } catch (e: any) {
    console.error("GET /connect-token:", e?.response?.data || e.message);
    res.status(500).json({ error: "CONNECT_TOKEN_FAILED" });
  }
});

/* ========================================================================== */
/* 4) Salvar / Listar itens                                                    */
/* ========================================================================== */

router.post("/items", async (req, res) => {
  try {
    const { itemId, provider } = req.body as {
      itemId: string;
      provider?: string;
    };
    if (!itemId) return res.status(400).json({ error: "ITEM_ID_REQUIRED" });

    await pool.query(
      `INSERT INTO items (id, provider) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE provider = VALUES(provider)`,
      [itemId, provider ?? null]
    );

    res.json({ ok: true });
  } catch (e: any) {
    console.error("POST /items:", e);
    res.status(500).json({ error: "SAVE_ITEM_FAILED" });
  }
});

router.get("/items", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, provider, created_at
         FROM items
        ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (e: any) {
    console.error("GET /items:", e);
    res.status(500).json({ error: "LIST_ITEMS_FAILED" });
  }
});

/* ========================================================================== */
/* 5) Helpers de UPSERT (Pluggy → Banco)                                       */
/* ========================================================================== */

async function upsertAccounts(apiKey: string, itemId: string) {
  const { data } = await axios.get("https://api.pluggy.ai/accounts", {
    params: { itemId },
    headers: { "X-API-KEY": apiKey },
  });

  const accounts: any[] = data.results || [];
  for (const a of accounts) {
    await pool.query(
      `INSERT INTO accounts (id, item_id, name, type, currency, balance, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),
         type=VALUES(type),
         currency=VALUES(currency),
         balance=VALUES(balance),
         updated_at=VALUES(updated_at)`,
      [a.id, itemId, a.name, a.type, a.currency || "BRL", a.balance ?? 0]
    );
  }
}

async function upsertTransactions(
  apiKey: string,
  itemId: string,
  fromISO: string
) {
  let page = 1;
  const pageSize = 50;

  while (true) {
    const { data } = await axios.get("https://api.pluggy.ai/transactions", {
      params: { itemId, from: fromISO, page, pageSize },
      headers: { "X-API-KEY": apiKey },
    });

    const list: any[] = data.results || [];
    for (const t of list) {
      const flow =
        t.type === "CREDIT"
          ? "INCOME"
          : t.type === "DEBIT"
          ? "EXPENSE"
          : Number(t.amount) < 0
          ? "EXPENSE"
          : "INCOME";

      const category =
        typeof t.category === "string"
          ? t.category
          : t.category?.detailed ?? t.category?.primary ?? null;

      await pool.query(
        `INSERT INTO transactions
           (id, account_id, description, date, amount, flow, category, currency, inserted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           description=VALUES(description),
           date=VALUES(date),
           amount=VALUES(amount),
           flow=VALUES(flow),
           category=VALUES(category),
           currency=VALUES(currency)`,
        [
          t.id,
          t.accountId,
          t.description || "",
          t.date,
          t.amount,
          flow,
          category,
          t.currency || "BRL",
        ]
      );
    }

    const total = data.total || 0;
    const lastPage = Math.ceil(total / pageSize) || 1;
    if (page >= lastPage) break;
    page++;
  }
}

/* ========================================================================== */
/* 6) Sincronizar todos os itens                                               */
/* ========================================================================== */

router.post("/sync-all", async (req, res) => {
  try {
    const from = (req.body?.from as string) || "2015-01-01T00:00:00.000Z";
    const apiKey = await getApiKey();

    const [rows] = await pool.query(`SELECT id FROM items`);
    const items: string[] = (rows as any[]).map((r) => r.id);

    for (const itemId of items) {
      await upsertAccounts(apiKey, itemId);
      await upsertTransactions(apiKey, itemId, from);
    }

    res.json({ ok: true, items: items.length });
  } catch (e: any) {
    console.error("POST /sync-all:", e?.response?.data || e.message);
    res.status(500).json({ error: "SYNC_FAILED" });
  }
});

/* ========================================================================== */
/* 7) Endpoints usados pelo frontend                                           */
/* ========================================================================== */

router.get("/accounts", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id,
              a.item_id,
              a.name,
              a.type,
              a.currency,
              a.balance,
              a.updated_at,
              i.provider
         FROM accounts a
         LEFT JOIN items i ON i.id = a.item_id
        ORDER BY a.updated_at DESC`
    );
    res.json(rows);
  } catch (e: any) {
    console.error("GET /accounts:", e);
    res.status(500).json({ error: "LIST_ACCOUNTS_FAILED" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const { from, to, page = "1", pageSize = "50" } =
      req.query as Record<string, string>;

    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 50));
    const offset = (p - 1) * ps;

    const params: any[] = [];
    const where: string[] = [];
    if (from) {
      where.push(`date >= ?`);
      params.push(new Date(from));
    }
    if (to) {
      where.push(`date < ?`);
      params.push(new Date(to));
    }
    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS
              id, account_id, description, date, amount, flow, category, currency
         FROM transactions
         ${whereSQL}
        ORDER BY date DESC
        LIMIT ? OFFSET ?`,
      [...params, ps, offset]
    );

    const [cnt] = await pool.query(`SELECT FOUND_ROWS() AS total`);
    const total = (cnt as any)[0].total as number;

    res.json({ results: rows, total, page: p, pageSize: ps });
  } catch (e: any) {
    console.error("GET /transactions:", e);
    res.status(500).json({ error: "LIST_TRANSACTIONS_FAILED" });
  }
});

router.get("/summary/monthly", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') AS ym,
              flow,
              SUM(ABS(amount)) AS total
         FROM transactions
        GROUP BY ym, flow
        ORDER BY ym DESC, flow`
    );
    res.json(rows);
  } catch (e: any) {
    console.error("GET /summary/monthly:", e);
    res.status(500).json({ error: "SUMMARY_FAILED" });
  }
});

export default router;
