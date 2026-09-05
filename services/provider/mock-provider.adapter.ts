import "server-only";
import { randomUUID } from "crypto";
import type {
  ProductProviderAdapter,
  ProviderOrderInput,
  ProviderOrderResult,
  ProviderOrderStatus,
  ProviderProduct,
} from "./types";

/**
 * *** DEVELOPMENT ONLY ***
 * Simulasi provider produk digital. Order selalu SUCCESS setelah delay singkat.
 * Jangan pakai di production — ganti dengan adapter provider asli (Digiflazz, dsb.)
 * begitu credential (PROVIDER_API_KEY/PROVIDER_USERNAME/PROVIDER_SECRET) tersedia.
 */
export class MockProviderAdapter implements ProductProviderAdapter {
  readonly name = "mock";

  async createOrder(input: ProviderOrderInput): Promise<ProviderOrderResult> {
    const providerOrderId = `MOCKPRV-${randomUUID()}`;
    return {
      providerOrderId,
      status: "SUCCESS",
      message: "Order berhasil diproses (mock).",
      rawResponse: { mock: true, input },
    };
  }

  async checkOrder(providerOrderId: string): Promise<ProviderOrderStatus> {
    return { providerOrderId, status: "SUCCESS", rawResponse: { mock: true } };
  }

  async getProducts(): Promise<ProviderProduct[]> {
    return [];
  }

  async getBalance(): Promise<number> {
    return 0;
  }
}
