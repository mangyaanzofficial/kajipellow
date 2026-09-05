import { requireUser } from "@/lib/guards";
import { getWalletSummary } from "@/services/wallet/wallet.service";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getWalletSummary(user.id);

  const stats = [
    { label: "Saldo", value: <PriceDisplay amount={summary.balance} className="text-primary text-xl" /> },
    { label: "Total Transaksi", value: summary.totalTransactions },
    { label: "Transaksi Berhasil", value: summary.successTransactions },
    { label: "Transaksi Pending", value: summary.pendingTransactions },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Halo, {user.name} 👋</h1>
      <p className="text-sm text-muted-foreground mb-6">Berikut ringkasan akun Anda.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <div className="text-lg font-semibold">{s.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
