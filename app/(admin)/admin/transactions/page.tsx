import { getAdminTransactions } from "@/services/admin/admin.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";
import { RetryButton } from "./retry-button";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const { search, status, page } = await searchParams;
  const result = await getAdminTransactions({ search, status, page: page ? Number(page) : 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transaction Management</h1>

      <form method="get" className="mb-4 max-w-sm">
        <Input name="search" defaultValue={search} placeholder="Cari invoice..." />
      </form>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-4">Invoice</th>
              <th className="p-4">User</th>
              <th className="p-4">Produk</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono text-xs">{t.invoiceNumber}</td>
                <td className="p-4">{t.user?.name ?? "Guest"}</td>
                <td className="p-4">{t.items[0]?.productName ?? "-"}</td>
                <td className="p-4"><PriceDisplay amount={t.totalAmount} /></td>
                <td className="p-4"><StatusBadge status={t.status} /></td>
                <td className="p-4 text-xs text-muted-foreground">{formatDate(t.createdAt)}</td>
                <td className="p-4">
                  {(t.status === "FAILED" || t.status === "PROCESSING") && <RetryButton id={t.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
