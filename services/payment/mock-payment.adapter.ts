import "server-only";
import { randomUUID, createHmac } from "crypto";
import type {
  PaymentGatewayAdapter,
  CreateTransactionInput,
  CreateTransactionResult,
  CheckTransactionResult,
  WebhookVerificationInput,
  WebhookVerificationResult,
  RefundInput,
  RefundResult,
} from "./types";

/**
 * *** DEVELOPMENT ONLY ***
 * Adapter ini TIDAK terhubung ke payment gateway sungguhan.
 * Dipakai supaya alur end-to-end (create → callback → paid) bisa ditest tanpa credential asli.
 * Jangan pernah deploy ke production dengan PAYMENT_PROVIDER=mock.
 */
export class MockPaymentAdapter implements PaymentGatewayAdapter {
  readonly name = "mock";

  private secret = process.env.PAYMENT_SECRET || "dev-mock-secret";

  async createTransaction(input: CreateTransactionInput): Promise<CreateTransactionResult> {
    const gatewayRefId = `MOCK-${randomUUID()}`;
    const expiresAt = new Date(Date.now() + (input.expiresInMinutes ?? 60) * 60 * 1000);

    return {
      gatewayRefId,
      qrString: input.method === "QRIS" ? `00020101MOCKQRIS${gatewayRefId}` : undefined,
      vaNumber: input.method === "VIRTUAL_ACCOUNT" ? `8808${Date.now()}` : undefined,
      paymentUrl: `/api/dev/mock-pay?ref=${gatewayRefId}&invoice=${input.invoiceNumber}`,
      expiresAt,
      rawResponse: { mock: true, input },
    };
  }

  async checkTransaction(gatewayRefId: string): Promise<CheckTransactionResult> {
    // Di dunia nyata ini memanggil API gateway. Mock ini selalu return PENDING;
    // status PAID disimulasikan lewat endpoint /api/dev/mock-pay yang memicu webhook.
    return { gatewayRefId, status: "PENDING", rawResponse: { mock: true } };
  }

  /**
   * Memverifikasi signature webhook. Gateway asli biasanya kirim header signature
   * yang dihitung dari HMAC(body, secret) — pola ini kita ikuti di mock.
   */
  async handleCallback(input: WebhookVerificationInput): Promise<WebhookVerificationResult> {
    const signature = input.headers["x-mock-signature"];
    const expectedSignature = createHmac("sha256", this.secret).update(input.rawBody).digest("hex");

    if (!signature || signature !== expectedSignature) {
      return { isValid: false };
    }

    const payload = JSON.parse(input.rawBody) as {
      invoiceNumber: string;
      gatewayRefId: string;
      status: "PAID" | "FAILED" | "EXPIRED";
      amount: number;
      eventId: string;
    };

    return {
      isValid: true,
      invoiceNumber: payload.invoiceNumber,
      gatewayRefId: payload.gatewayRefId,
      status: payload.status,
      amount: payload.amount,
      eventId: payload.eventId,
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    return { success: true, refundId: `MOCK-REFUND-${randomUUID()}`, rawResponse: { mock: true, input } };
  }

  /** Helper khusus mock untuk membuat signature yang valid (dipakai endpoint dev simulasi bayar) */
  signPayload(rawBody: string): string {
    return createHmac("sha256", this.secret).update(rawBody).digest("hex");
  }
}
