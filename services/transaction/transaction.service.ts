import "server-only";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "./invoice";
import { getPaymentAdapter } from "@/providers/payment-provider.factory";
import { getProductProviderAdapter } from "@/providers/product-provider.factory";
import type { PaymentMethodKey } from "@/services/payment/types";

export class TransactionError extends Error {}

/**
 * STEP 1 dari alur order: buat Transaction berstatus PENDING.
 * ATURAN KRITIKAL: harga TIDAK PERNAH diambil dari client. Selalu di-re-fetch dari DB
 * di sini (product.sellPrice / product.adminFee), sesuai poin #22 & #40 brief.
 */
export async function createProductOrder(input: {
  userId?: string;
  productId: string;
  targetNumber: string;
  targetServerId?: string;
  idempotencyKey: string;
}) {
  // Idempotency check lebih awal untuk menghindari kerja ganda pada double-submit
  const existing = await prisma.transaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return existing;

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || !product.isActive) {
    throw new TransactionError("Produk tidak tersedia.");
  }
  if (product.requiresServerId && !input.targetServerId) {
    throw new TransactionError("Server ID wajib diisi untuk produk ini.");
  }

  const subtotal = product.sellPrice;
  const adminFee = product.adminFee;
  const totalAmount = subtotal + adminFee;

  const transaction = await prisma.$transaction(async (tx) => {
    return tx.transaction.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        idempotencyKey: input.idempotencyKey,
        userId: input.userId,
        type: "PRODUCT_ORDER",
        status: "PENDING",
        targetNumber: input.targetNumber,
        targetServerId: input.targetServerId,
        subtotal,
        adminFee,
        totalAmount,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              priceAtPurchase: product.sellPrice,
            },
          ],
        },
      },
    });
  });

  return transaction;
}

/**
 * STEP 2: user memilih metode pembayaran di halaman checkout -> buat Payment via adapter.
 */
export async function initiatePayment(transactionId: string, method: PaymentMethodKey, customerName: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction) throw new TransactionError("Transaksi tidak ditemukan.");
  if (transaction.status !== "PENDING") throw new TransactionError("Transaksi ini sudah diproses sebelumnya.");
  if (transaction.paymentId) {
    const existingPayment = await prisma.payment.findUnique({ where: { id: transaction.paymentId } });
    if (existingPayment) return existingPayment;
  }

  const adapter = getPaymentAdapter();
  const result = await adapter.createTransaction({
    invoiceNumber: transaction.invoiceNumber,
    amount: transaction.totalAmount,
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
        amount: transaction.totalAmount,
        qrString: result.qrString,
        vaNumber: result.vaNumber,
        paymentUrl: result.paymentUrl,
        gatewayResponseRaw: result.rawResponse as object,
        expiresAt: result.expiresAt,
      },
    });

    await tx.transaction.update({ where: { id: transaction.id }, data: { paymentId: created.id } });
    return created;
  });

  return payment;
}

/**
 * STEP 3: dipanggil oleh webhook handler SETELAH signature & idempotency tervalidasi,
 * ketika payment gateway melaporkan status PAID.
 * Menandai Payment+Transaction PAID, lalu lanjut proses ke provider.
 */
export async function markTransactionPaid(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId }, include: { items: true } });
  if (!transaction) throw new TransactionError("Transaksi tidak ditemukan.");

  // Idempotent guard: kalau sudah bukan PENDING, jangan proses ulang (mencegah duplicate webhook)
  if (transaction.status !== "PENDING") return transaction;

  await prisma.$transaction([
    prisma.transaction.update({ where: { id: transaction.id }, data: { status: "PAID" } }),
    ...(transaction.paymentId
      ? [prisma.payment.update({ where: { id: transaction.paymentId }, data: { status: "PAID", paidAt: new Date() } })]
      : []),
  ]);

  await processProductDelivery(transaction.id);
}

/**
 * STEP 4: setelah PAID, kirim order ke product provider (adapter), lalu update status akhir.
 */
export async function processProductDelivery(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { items: { include: { product: { include: { provider: true } } } } },
  });
  if (!transaction || transaction.status !== "PAID") return;

  await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "PROCESSING" } });

  const firstItem = transaction.items[0];
  if (!firstItem) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED", failureReason: "Item transaksi tidak ditemukan." },
    });
    return;
  }

  try {
    const adapter = getProductProviderAdapter(firstItem.product.provider.code);
    const result = await adapter.createOrder({
      sku: firstItem.product.providerSku,
      targetNumber: transaction.targetNumber ?? "",
      targetServerId: transaction.targetServerId ?? undefined,
      refId: transaction.id,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: result.status === "SUCCESS" ? "SUCCESS" : result.status === "FAILED" ? "FAILED" : "PROCESSING",
        providerOrderId: result.providerOrderId,
        providerResponseRaw: result.rawResponse as object,
        failureReason: result.status === "FAILED" ? result.message : null,
      },
    });

    if (result.status === "FAILED") {
      await refundToWallet(transaction.id, "Produk gagal diproses oleh provider.");
    }
  } catch (err) {
    console.error("processProductDelivery error:", err);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED", failureReason: "Terjadi kesalahan saat menghubungi provider." },
    });
    await refundToWallet(transaction.id, "Kesalahan sistem saat memproses produk.");
  }
}

/**
 * Refund ke saldo wallet user jika transaksi gagal setelah dibayar.
 * Hanya berlaku untuk transaksi yang punya userId (guest checkout tidak direfund otomatis ke wallet).
 */
async function refundToWallet(transactionId: string, reason: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction || !transaction.userId) return;

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId: transaction.userId! } });
    if (!wallet) return;

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + BigInt(transaction.totalAmount);

    // Unique constraint [referenceType, referenceId, type] pada WalletMutation mencegah refund ganda
    await tx.walletMutation.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT",
        amount: transaction.totalAmount,
        balanceBefore,
        balanceAfter,
        referenceType: "REFUND",
        referenceId: transaction.id,
        note: reason,
      },
    });

    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
    await tx.transaction.update({ where: { id: transaction.id }, data: { status: "REFUNDED" } });
  }).catch((err) => {
    // Kalau gagal karena unique constraint (refund ganda), abaikan dengan aman
    console.warn("refundToWallet skipped (kemungkinan sudah pernah direfund):", err);
  });
}
