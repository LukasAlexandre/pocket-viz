import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PluggyConnect?: any;
  }
}

type Props = { onConnected?: () => void };

/** Garante que o SDK esteja no window carregando via backend. */
async function ensurePluggySDK(): Promise<void> {
  if (window.PluggyConnect) return;

  const SCRIPT_ID = "pluggy-connect-sdk";
  if (!document.getElementById(SCRIPT_ID)) {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.defer = true;
    // servido pelo seu backend (evita CORB/ORB)
    s.src = "/api/openfinance/sdk/pluggy-connect.js";
    document.head.appendChild(s);
  }

  const start = Date.now();
  while (!window.PluggyConnect) {
    await new Promise((r) => setTimeout(r, 100));
    if (Date.now() - start > 8000) {
      throw new Error("Timeout ao carregar PluggyConnect SDK");
    }
  }
}

export default function OpenFinanceButton({ onConnected }: Props) {
  const connectRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await ensurePluggySDK();

        const r = await fetch("/api/openfinance/connect-token");
        if (!r.ok) throw new Error("Falha ao obter connect-token");
        const { accessToken } = await r.json();

        const connect = new window.PluggyConnect({
          connectToken: accessToken,
          includeSandbox: false,
          onSuccess: async ({ item }: any) => {
            try {
              // salva item
              await fetch("/api/openfinance/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itemId: item?.id,
                  provider: item?.connector?.name,
                }),
              });
              // sincroniza tudo
              await fetch("/api/openfinance/sync-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ from: "2015-01-01T00:00:00.000Z" }),
              });
              onConnected?.();
            } catch (e) {
              console.error("Erro ao salvar/sincronizar:", e);
            }
          },
          onError: (err: any) => console.error("PluggyConnect error:", err),
        });

        if (!mounted) return;
        connectRef.current = connect;
        setReady(true);
      } catch (e) {
        console.error("Boot do OpenFinanceButton falhou:", e);
        setReady(false);
      }
    })();

    return () => { mounted = false; };
  }, [onConnected]);

  function open() {
    if (!connectRef.current) {
      alert("PluggyConnect ainda não carregou. Tente novamente em alguns segundos.");
      return;
    }
    if (busy) return;

    setBusy(true);
    try {
      connectRef.current.open(); // método correto
    } finally {
      setTimeout(() => setBusy(false), 800);
    }
  }

  return (
    <Button onClick={open} disabled={!ready || busy}>
      {busy ? "Abrindo..." : "Conectar via Open Finance"}
    </Button>
  );
}
