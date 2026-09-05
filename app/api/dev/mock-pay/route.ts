import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MockPaymentAdapter } from "@/services/payment/mock-payment.adapter";

/**
 * *** DEVELOPMENT ONLY ***
 * Endpoint ini mensimulasikan user menyelesaikan pembayaran di sisi gateway,
 * lalu mengirim webhook ke /api/webhook/payment persis seperti gateway asli akan lakukan
 * (lengkap dengan signature valid) — supaya alur PAID -> PROCESSING -> SUCCESS bisa ditest
 * tanpa payment gateway sungguhan.
 *
 * WAJIB dinonaktifkan/dihapus di production (cek NODE_ENV di bawah).
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const ref = request.nextUrl.searchParams.get("ref");
  const invoice = request.nextUrl.searchParams.get("invoice");
  if (!ref || !invoice) {
    return NextResponse.json({ error: "Missing ref/invoice" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({ where: { invoiceNumber: invoice } });
  if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

  const adapter = new MockPaymentAdapter();
  const payload = JSON.stringify({
    invoiceNumber: invoice,
    gatewayRefId: ref,
    status: "PAID",
    amount: transaction.totalAmount,
    eventId: `${ref}-paid`,
  });
  const signature = adapter.signPayload(payload);

  const webhookUrl = new URL("/api/webhook/payment", request.url);
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json", "x-mock-signature": signature },
    body: payload,
  });

  return NextResponse.json({ forwarded: true, webhookStatus: res.status });
}
