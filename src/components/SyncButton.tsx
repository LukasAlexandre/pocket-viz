import { useState } from "react";

type Props = { onDone?: () => void };

function firstDayOfCurrentMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0).toISOString();
}

export default function SyncButton({ onDone }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const from = firstDayOfCurrentMonthISO();
      const res = await fetch("/api/openfinance/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from }),
      }).then(r => r.json());

      console.log("sync-all:", res);
      onDone?.();
    } catch (err) {
      console.error(err);
      alert("Falha ao sincronizar. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      title="Sincronizar extratos do Open Finance"
    >
      {/* ícone refresh minimalista */}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className={loading ? "animate-spin" : ""}>
        <path d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z"/>
      </svg>
      {loading ? "Sincronizando..." : "Sincronizar"}
    </button>
  );
}
