import "server-only";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/providers/payment-provider.factory";
import type { PaymentMethodKey } from "@/services/payment/types";

export class DepositError extends Error {}

const MIN_DEPOSIT = 10_000;
const MAX_DEPOSIT = 10_000_000;

export async function createDeposit(input: { userId: string; amount: number; idempotencyKey: string }) {
  if (input.amount < MIN_DEPOSIT || input.amount > MAX_DEPOSIT) {
    throw new DepositError(`Nominal deposit harus antara Rp${MIN_DEPOSIT.toLocaleString("id-ID")} - Rp${MAX_DEPOSIT.toLocaleString("id-ID")}.`);
  }

  const existing = await prisma.deposit.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return existing;

  return prisma.deposit.create({
    data: { userId: input.userId, amount: input.amount, idempotencyKey: input.idempotencyKey, status: "PENDING" },
  });
}

export async function initiateDepositPayment(depositId: string, method: PaymentMethodKey, customerName: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) throw new DepositError("Deposit tidak ditemukan.");
  if (deposit.status !== "PENDING") throw new DepositError("Deposit ini sudah diproses.");

  const adapter = getPaymentAdapter();
  // Prefix "DEP-" dipakai webhook untuk membedakan callback deposit vs order produk
  const result = await adapter.createTransaction({
    invoiceNumber: `DEP-${deposit.id}`,
    amount: deposit.amount,
    method,
    customerName,
    expiresInMinutes: 60,
  });

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        gatewayName: adapter.name,
        gatewayRefId: result.gatewayRefId,
        method,
        status: "PENDING",
        amount: deposit.amount,
        qrString: result.qrString,
        vaNumber: result.vaNumber,
        paymentUrl: result.paymentUrl,
        gatewayResponseRaw: result.rawResponse as object,
        expiresAt: result.expiresAt,
      },
    });
    await tx.deposit.update({ where: { id: deposit.id }, data: { paymentId: created.id } });
    return created;
  });

  return payment;
}

/**
 * Dipanggil oleh webhook handler setelah signature & nominal tervalidasi.
 * Menggunakan WalletMutation dengan referenceType="DEPOSIT" + unique constraint
 * [referenceType, referenceId, type] untuk mencegah saldo ditambahkan dua kali
 * akibat webhook duplikat (lihat brief poin #14 & #23).
 */
export async function markDepositPaid(depositId: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) throw new DepositError("Deposit tidak ditemukan.");
  if (deposit.status !== "PENDING") return deposit; // idempotent guard

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId: deposit.userId },
      update: {},
      create: { userId: deposit.userId, balance: 0 },
    });

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + BigInt(deposit.amount);

    await tx.walletMutation.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        amount: deposit.amount,
        balanceBefore,
        balanceAfter,
        referenceType: "DEPOSIT",
        referenceId: deposit.id,
        note: "Deposit berhasil",
      },
    });

    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
    await tx.deposit.update({ where: { id: deposit.id }, data: { status: "PAID" } });
    if (deposit.paymentId) {
      await tx.payment.update({ where: { id: deposit.paymentId }, data: { status: "PAID", paidAt: new Date() } });
    }
  });
}
