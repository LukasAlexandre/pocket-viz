
export default function OpenFinanceButton() {
  async function handleConnect() {
    const { accessToken } = await fetch("/api/openfinance/connect-token").then(r => r.json());
    // Garante que o SDK externo foi carregado
    if (!(window as any).PluggyConnect) {
      alert("PluggyConnect SDK não carregado!\nVerifique se o script está no index.html.");
      return;
    }
    const connect = new (window as any).PluggyConnect({
      connectToken: accessToken,
      onSuccess: async ({ item }: any) => {
        await fetch(`/api/openfinance/sync?itemId=${item.id}&from=2025-01-01`);
        alert("Sincronizado com sucesso!");
      },
    });
    connect.show();
  }
  return (
    <button onClick={handleConnect} className="px-4 py-2 bg-primary text-white rounded">
      Conectar Nubank via Open Finance
    </button>
  );
}
