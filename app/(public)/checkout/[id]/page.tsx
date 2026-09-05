import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { PaymentMethodForm } from "./payment-method-form";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!transaction) notFound();

  // Kalau transaksi sudah tidak PENDING (misal sudah pernah bayar), langsung ke invoice
  if (transaction.status !== "PENDING") {
    redirect(`/invoice/${transaction.id}`);
  }

  const item = transaction.items[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <Card className="p-6 mb-6">
        <p className="text-xs text-muted-foreground mb-1">Invoice</p>
        <p className="font-mono text-sm mb-4">{transaction.invoiceNumber}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produk</span>
            <span>{item?.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tujuan</span>
            <span>{transaction.targetNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Harga Produk</span>
            <PriceDisplay amount={transaction.subtotal} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Biaya Admin</span>
            <PriceDisplay amount={transaction.adminFee} />
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <span>Total Pembayaran</span>
            <PriceDisplay amount={transaction.totalAmount} className="text-primary text-lg" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-medium mb-4">Pilih Metode Pembayaran</h2>
        <PaymentMethodForm transactionId={transaction.id} />
      </Card>
    </div>
  );
}
