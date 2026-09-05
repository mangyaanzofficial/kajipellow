import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentAdapter } from "@/providers/payment-provider.factory";
import { markTransactionPaid } from "@/services/transaction/transaction.service";
import { markDepositPaid } from "@/services/wallet/deposit.service";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/webhook/payment
 *
 * PRINSIP KEAMANAN (lihat brief poin #8):
 * 1. JANGAN PERNAH percaya body request begitu saja — signature harus tervalidasi oleh adapter.
 * 2. Nominal & invoice HARUS dicocokkan ulang ke data transaksi yang tersimpan di DB kita,
 *    bukan hanya mengikuti apa yang dikirim gateway.
 * 3. Idempotency: setiap event webhook dicatat di WebhookLog dengan unique constraint
 *    [source, eventId] — event yang sama yang datang berkali-kali (retry gateway) hanya
 *    diproses SEKALI.
 * 4. Semua request (valid maupun tidak) tetap dicatat ke WebhookLog untuk audit.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`webhook:${ip}`, RATE_LIMITS.WEBHOOK.limit, RATE_LIMITS.WEBHOOK.windowMs);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await request.text();
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => (headersObj[key] = value));

  const adapter = getPaymentAdapter();

  let verification;
  try {
    verification = await adapter.handleCallback({ rawBody, headers: headersObj });
  } catch (err) {
    console.error("Webhook verification threw an error:", err);
    await prisma.webhookLog.create({
      data: { source: "payment", signatureValid: false, payloadRaw: safeParse(rawBody), processingNote: "Verification threw error" },
    }).catch(() => {});
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!verification.isValid) {
    await prisma.webhookLog.create({
      data: { source: "payment", signatureValid: false, payloadRaw: safeParse(rawBody), processingNote: "Invalid signature" },
    }).catch(() => {});
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { invoiceNumber, status, amount, eventId } = verification;

  // Idempotency: kalau eventId ini sudah pernah diproses, langsung return 200 tanpa proses ulang
  if (eventId) {
    const alreadyProcessed = await prisma.webhookLog.findUnique({
      where: { source_eventId: { source: "payment", eventId } },
    });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  // Deposit callback (invoiceNumber berformat "DEP-<id>")
  if (invoiceNumber?.startsWith("DEP-")) {
    const depositId = invoiceNumber.replace("DEP-", "");
    const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });

    const log = await prisma.webhookLog.create({
      data: { source: "payment", eventId: eventId ?? undefined, signatureValid: true, payloadRaw: safeParse(rawBody) },
    });

    if (!deposit) {
      await prisma.webhookLog.update({ where: { id: log.id }, data: { processingNote: "Deposit not found", processedAt: new Date() } });
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (typeof amount === "number" && amount !== deposit.amount) {
      await prisma.webhookLog.update({ where: { id: log.id }, data: { processingNote: "Amount mismatch", processedAt: new Date() } });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    try {
      if (status === "PAID") {
        await markDepositPaid(deposit.id);
      } else if (status === "FAILED" || status === "EXPIRED") {
        await prisma.deposit.updateMany({ where: { id: deposit.id, status: "PENDING" }, data: { status: status === "EXPIRED" ? "EXPIRED" : "FAILED" } });
      }
      await prisma.webhookLog.update({ where: { id: log.id }, data: { processedAt: new Date(), processingNote: `Processed status=${status}` } });
    } catch (err) {
      console.error("Webhook deposit processing error:", err);
      await prisma.webhookLog.update({ where: { id: log.id }, data: { processingNote: "Processing threw error", processedAt: new Date() } });
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  // Product order callback (invoiceNumber berformat "INV-...")
  const transaction = invoiceNumber
    ? await prisma.transaction.findUnique({ where: { invoiceNumber } })
    : null;

  const log = await prisma.webhookLog.create({
    data: {
      source: "payment",
      eventId: eventId ?? undefined,
      transactionId: transaction?.id,
      signatureValid: true,
      payloadRaw: safeParse(rawBody),
    },
  });

  if (!transaction) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingNote: "Transaction not found for invoiceNumber", processedAt: new Date() },
    });
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  // Verifikasi nominal — WAJIB cocok dengan yang tercatat di DB kita
  if (typeof amount === "number" && amount !== transaction.totalAmount) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingNote: `Amount mismatch: expected ${transaction.totalAmount}, got ${amount}`, processedAt: new Date() },
    });
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  try {
    if (status === "PAID") {
      await markTransactionPaid(transaction.id);
    } else if (status === "FAILED" || status === "EXPIRED") {
      await prisma.transaction.updateMany({
        where: { id: transaction.id, status: "PENDING" },
        data: { status: status === "EXPIRED" ? "EXPIRED" : "FAILED" },
      });
    }

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processedAt: new Date(), processingNote: `Processed status=${status}` },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { processingNote: "Processing threw error", processedAt: new Date() },
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function safeParse(rawBody: string): object {
  try {
    return JSON.parse(rawBody);
  } catch {
    return { raw: rawBody.slice(0, 2000) };
  }
}
