import { getAdminDashboardStats } from "@/services/admin/admin.service";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Total User", value: stats.totalUsers },
    { label: "Total Transaksi", value: stats.totalTransactions },
    { label: "Transaksi Hari Ini", value: stats.todayTransactions },
    { label: "Transaksi Pending", value: stats.pendingTransactions },
    { label: "Transaksi Berhasil", value: stats.successTransactions },
    { label: "Transaksi Gagal", value: stats.failedTransactions },
    { label: "Total Omzet", value: <PriceDisplay amount={stats.totalOmzet} /> },
    { label: "Total Profit", value: <PriceDisplay amount={stats.totalProfit} className="text-success" /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <div className="text-lg font-semibold">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
