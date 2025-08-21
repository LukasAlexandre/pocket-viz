// src/pages/Contas.tsx
import { useCallback, useEffect, useState } from "react";
import OpenFinanceButton from "@/components/OpenFinanceButton";
import { Button } from "@/components/ui/button";

type Account = {
  id: string;
  item_id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  updated_at: string;
  provider?: string | null; // vem do LEFT JOIN com items (quando conectado ao Open Finance)
};

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/openfinance/accounts", {
        headers: { Accept: "application/json" },
      });
      const data = await r.json().catch(() => []);
      if (!r.ok) {
        throw new Error(
          typeof (data as any)?.error === "string"
            ? (data as any).error
            : `HTTP ${r.status}`
        );
      }
      setAccounts(Array.isArray(data) ? (data as Account[]) : []);
    } catch (e) {
      console.error("Falha ao carregar contas:", e);
      setAccounts([]);
      setError("Falha ao carregar contas. Conecte uma conta e/ou sincronize.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const syncAll = useCallback(async () => {
    try {
      setSyncing(true);
      await fetch("/api/openfinance/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: "2015-01-01T00:00:00.000Z" }),
      });
      await load();
    } catch (e) {
      console.error("Erro ao sincronizar:", e);
      setError("Não foi possível sincronizar agora.");
    } finally {
      setSyncing(false);
    }
  }, [load]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Contas Conectadas</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={syncAll} disabled={syncing}>
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
          <OpenFinanceButton onConnected={load} />
        </div>
      </div>

      {loading && <div className="text-muted-foreground">Carregando contas…</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && accounts.length === 0 && (
        <div className="text-muted-foreground">Nenhuma conta encontrada.</div>
      )}

      {!loading && accounts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{acc.name}</div>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    acc.provider
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                  title={acc.provider ?? "Conta local"}
                >
                  {acc.provider ? "Sincronizada" : "Local"}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                {acc.type} • {acc.currency}
                {acc.provider ? ` • ${acc.provider}` : ""}
              </div>

              <div className="mt-2 text-lg font-semibold">
                {Number(acc.balance).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: acc.currency || "BRL",
                })}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                Atualizado em{" "}
                {acc.updated_at
                  ? new Date(acc.updated_at).toLocaleString()
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
