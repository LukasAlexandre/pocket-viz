import OpenFinanceButton from "@/components/OpenFinanceButton";

export default function Contas() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Contas Conectadas</h1>
      <p className="mb-6 text-muted-foreground">Conecte e consulte suas contas bancárias via Open Finance.</p>
      <OpenFinanceButton />
      {/* Aqui você pode listar as contas conectadas futuramente */}
    </div>
  );
}
