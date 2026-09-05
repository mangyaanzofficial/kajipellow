import "server-only";
import type { PaymentGatewayAdapter } from "@/services/payment/types";
import { MockPaymentAdapter } from "@/services/payment/mock-payment.adapter";

/**
 * Factory untuk memilih payment gateway aktif berdasarkan env PAYMENT_PROVIDER.
 * Untuk menambah gateway baru (misal Midtrans):
 *   1. Buat file services/payment/midtrans-payment.adapter.ts yang implement PaymentGatewayAdapter
 *   2. Tambahkan case "midtrans" di sini
 * Tidak ada kode lain (checkout, webhook, dsb.) yang perlu diubah.
 */
export function getPaymentAdapter(): PaymentGatewayAdapter {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  switch (provider) {
    case "mock":
      return new MockPaymentAdapter();
    // case "midtrans":
    //   return new MidtransPaymentAdapter();
    // case "xendit":
    //   return new XenditPaymentAdapter();
    default:
      throw new Error(`Payment provider "${provider}" belum didukung.`);
  }
}
