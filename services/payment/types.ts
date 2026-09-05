/**
 * PAYMENT GATEWAY ADAPTER
 * Interface ini WAJIB diimplementasikan oleh setiap payment gateway yang ingin dipakai.
 * Ganti gateway = buat class baru yang implement interface ini, lalu daftarkan di
 * providers/payment-provider.factory.ts. Tidak ada kode lain yang perlu diubah.
 */

export type PaymentMethodKey = "QRIS" | "VIRTUAL_ACCOUNT" | "E_WALLET" | "BANK_TRANSFER" | "OTHER";

export interface CreateTransactionInput {
  invoiceNumber: string;
  amount: number;
  method: PaymentMethodKey;
  customerName: string;
  customerEmail?: string;
  expiresInMinutes?: number;
}

export interface CreateTransactionResult {
  gatewayRefId: string;
  qrString?: string;
  vaNumber?: string;
  paymentUrl?: string;
  expiresAt: Date;
  rawResponse: unknown;
}

export interface CheckTransactionResult {
  gatewayRefId: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  paidAt?: Date;
  rawResponse: unknown;
}

export interface WebhookVerificationInput {
  rawBody: string;
  headers: Record<string, string>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  invoiceNumber?: string;
  gatewayRefId?: string;
  status?: "PAID" | "FAILED" | "EXPIRED";
  amount?: number;
  eventId?: string; // dipakai untuk dedup di WebhookLog
}

export interface RefundInput {
  gatewayRefId: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  rawResponse: unknown;
}

export interface PaymentGatewayAdapter {
  readonly name: string;
  createTransaction(input: CreateTransactionInput): Promise<CreateTransactionResult>;
  checkTransaction(gatewayRefId: string): Promise<CheckTransactionResult>;
  handleCallback(input: WebhookVerificationInput): Promise<WebhookVerificationResult>;
  refund(input: RefundInput): Promise<RefundResult>;
}
