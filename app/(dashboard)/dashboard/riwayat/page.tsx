import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { getUserTransactions } from "@/services/wallet/wallet.service";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/cn";

const STATUS_FILTERS = ["", "PENDING", "PAID", "PROCESSING", "SUCCESS", "FAILED", "EXPIRED", "REFUNDED"];

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const user = await requireUser();
  const { status, page } = await searchParams;
  const result = await getUserTransactions(user.id, { status: status || undefined, page: page ? Number(page) : 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Riwayat Transaksi</h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s || "ALL"}
            href={s ? `/dashboard/riwayat?status=${s}` : "/dashboard/riwayat"}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs border border-border",
              (status || "") === s ? "bg-gradient-brand text-white border-transparent" : "bg-white/5 text-muted-foreground"
            )}
          >
            {s || "Semua"}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {result.items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
        {result.items.map((t) => (
          <Link key={t.id} href={`/invoice/${t.id}`}>
            <Card className="p-4 flex items-center justify-between hover:border-primary/40 transition-colors">
              <div>
                <p className="font-medium text-sm">{t.items[0]?.productName ?? "Deposit"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.invoiceNumber} · {formatDate(t.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <PriceDisplay amount={t.totalAmount} className="block mb-1" />
                <StatusBadge status={t.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/riwayat?${status ? `status=${status}&` : ""}page=${p}`}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-sm border border-border",
                result.page === p ? "bg-gradient-brand text-white border-transparent" : "bg-white/5"
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
