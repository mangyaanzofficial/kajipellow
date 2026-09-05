import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { DepositPayForm } from "./pay-form";

export default async function DepositDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const deposit = await prisma.deposit.findUnique({ where: { id }, include: { payment: true } });
  if (!deposit || deposit.userId !== user.id) notFound();

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deposit Saldo</h1>
        <StatusBadge status={deposit.status} />
      </div>

      <Card className="p-6 mb-6 flex justify-between items-center">
        <span className="text-muted-foreground text-sm">Nominal</span>
        <PriceDisplay amount={deposit.amount} className="text-primary text-lg" />
      </Card>

      {deposit.status === "PENDING" && !deposit.payment && (
        <Card className="p-6">
          <h2 className="font-medium mb-4">Pilih Metode Pembayaran</h2>
          <DepositPayForm depositId={deposit.id} />
        </Card>
      )}

      {deposit.status === "PENDING" && deposit.payment?.qrString && (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Scan QRIS untuk membayar</p>
          <div className="mx-auto w-48 h-48 bg-white rounded-xl flex items-center justify-center text-black text-xs p-2 break-all">
            {deposit.payment.qrString}
          </div>
        </Card>
      )}

      {deposit.status === "PAID" && (
        <p className="text-sm text-success">Deposit berhasil, saldo Anda sudah bertambah.</p>
      )}
    </div>
  );
}
