import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";

export const metadata = { title: "Cek Transaksi" };

// Dibuat sebagai Server Component dengan GET form (searchParams) — tidak perlu client JS
// untuk pencarian sederhana seperti ini.
export default async function CekTransaksiPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  const transaction = id
    ? await prisma.transaction.findFirst({
        where: { OR: [{ id }, { invoiceNumber: id }] },
        include: { items: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Cek Transaksi</h1>

      <form method="get" className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input name="id" defaultValue={id} placeholder="Masukkan Transaction ID / Invoice" />
        </div>
        <Button type="submit">Cek</Button>
      </form>

      {id && !transaction && (
        <p className="text-sm text-muted-foreground">Transaksi tidak ditemukan. Periksa kembali ID yang Anda masukkan.</p>
      )}

      {transaction && (
        <Card className="p-6 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Produk</span><span>{transaction.items[0]?.productName ?? "Deposit"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tanggal</span><span>{formatDate(transaction.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total</span><PriceDisplay amount={transaction.totalAmount} /></div>
          <div className="flex justify-between items-center"><span className="text-muted-foreground">Status</span><StatusBadge status={transaction.status} /></div>
        </Card>
      )}
    </div>
  );
}
