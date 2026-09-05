import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      wallet: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 20, include: { items: true } },
    },
  });
  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">{user.email} · @{user.username} · {user.phone}</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs text-muted-foreground mb-1">Saldo</p><PriceDisplay amount={user.wallet ? Number(user.wallet.balance) : 0} /></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground mb-1">Role</p><p className="font-medium">{user.role}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground mb-1">Status</p><p className="font-medium">{user.status}</p></Card>
      </div>

      <h2 className="font-medium mb-3">Transaksi Terakhir</h2>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-3">Invoice</th>
              <th className="p-3">Produk</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {user.transactions.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-3 font-mono text-xs">{t.invoiceNumber}</td>
                <td className="p-3">{t.items[0]?.productName ?? "Deposit"}</td>
                <td className="p-3"><PriceDisplay amount={t.totalAmount} /></td>
                <td className="p-3"><StatusBadge status={t.status} /></td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
