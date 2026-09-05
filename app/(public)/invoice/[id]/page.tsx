import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/utils/date";

const STATUS_MESSAGE: Record<string, string> = {
  PENDING: "Menunggu pembayaran. Selesaikan pembayaran sebelum batas waktu habis.",
  PAID: "Pembayaran diterima. Produk sedang diproses.",
  PROCESSING: "Produk sedang diproses oleh sistem kami.",
  SUCCESS: "Transaksi berhasil. Tidak perlu melakukan pembayaran lagi.",
  FAILED: "Transaksi gagal. Jika Anda sudah membayar, dana telah/akan dikembalikan ke saldo Anda.",
  EXPIRED: "Transaksi kedaluwarsa karena tidak ada pembayaran.",
  REFUNDED: "Transaksi direfund ke saldo akun Anda.",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });

  if (!transaction) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <StatusBadge status={transaction.status} />
      </div>

      <Card className="p-6 mb-6">
        <p className="text-sm text-muted-foreground">{STATUS_MESSAGE[transaction.status]}</p>
      </Card>

      {transaction.status === "PENDING" && transaction.payment?.qrString && (
        <Card className="p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Scan QRIS untuk membayar</p>
          <div className="mx-auto w-48 h-48 bg-white rounded-xl flex items-center justify-center text-black text-xs p-2 break-all">
            {transaction.payment.qrString}
          </div>
        </Card>
      )}

      {transaction.status === "PENDING" && transaction.payment?.vaNumber && (
        <Card className="p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Nomor Virtual Account</p>
          <p className="text-xl font-mono font-semibold">{transaction.payment.vaNumber}</p>
        </Card>
      )}

      <Card className="p-6 space-y-2 text-sm">
        <Row label="Invoice" value={transaction.invoiceNumber} mono />
        <Row label="Produk" value={transaction.items[0]?.productName ?? "-"} />
        <Row label="Tujuan" value={transaction.targetNumber ?? "-"} />
        <Row label="Metode Pembayaran" value={transaction.payment?.method ?? "-"} />
        <Row label="Tanggal" value={formatDate(transaction.createdAt)} />
        <div className="flex justify-between border-t border-border pt-2 font-medium">
          <span>Total</span>
          <PriceDisplay amount={transaction.totalAmount} className="text-primary" />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}
