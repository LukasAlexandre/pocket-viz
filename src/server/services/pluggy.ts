import axios from "axios";

let apiKeyCache: { key: string | null; exp: number } = { key: null, exp: 0 };

export async function getApiKey() {
  const now = Date.now();
  if (apiKeyCache.key && apiKeyCache.exp > now) return apiKeyCache.key!;
  const { data } = await axios.post("https://api.pluggy.ai/auth", {
    clientId: process.env.PLUGGY_CLIENT_ID,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET,
  });
  apiKeyCache = { key: data.apiKey, exp: now + 50 * 60 * 1000 };
  return apiKeyCache.key!;
}

export async function getConnectToken() {
  const key = await getApiKey();
  const { data } = await axios.post("https://api.pluggy.ai/connect_token", {}, {
    headers: { "X-API-KEY": key },
  });
  return data.accessToken as string;
}

export async function fetchAccounts(itemId: string) {
  const key = await getApiKey();
  const { data } = await axios.get(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
    headers: { "X-API-KEY": key },
  });
  return data.results as any[];
}

export async function fetchAllTransactions(itemId: string, fromISO: string) {
  const key = await getApiKey();
  const pageSize = 200;
  let page = 1, all: any[] = [];
  for (;;) {
    const { data } = await axios.get(
      `https://api.pluggy.ai/transactions?itemId=${itemId}&from=${fromISO}&page=${page}&pageSize=${pageSize}`,
      { headers: { "X-API-KEY": key } }
    );
    const batch: any[] = data.results || [];
    all.push(...batch);
    if (batch.length < pageSize) break;
    page++;
  }
  return all;
}

export function txFlow(tx: any): "INCOME" | "EXPENSE" {
  // Pluggy: type "CREDIT"/"DEBIT" + sinal do amount
  if (tx.type === "CREDIT") return "INCOME";
  if (tx.type === "DEBIT") return "EXPENSE";
  return Number(tx.amount) < 0 ? "EXPENSE" : "INCOME";
}

export function txCategory(tx: any): string | null {
  if (typeof tx.category === "string") return tx.category;
  return tx.category?.detailed ?? tx.category?.primary ?? null;
}
