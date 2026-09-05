/**
 * PRODUCT PROVIDER ADAPTER
 * Interface untuk provider produk digital (PPOB/game topup supplier).
 * Tambah provider baru = buat class baru yang implement ini + daftarkan di factory.
 */

export interface ProviderOrderInput {
  sku: string;
  targetNumber: string;
  targetServerId?: string;
  refId: string; // id transaksi internal kita, dipakai provider untuk idempotency di sisi mereka
}

export interface ProviderOrderResult {
  providerOrderId: string;
  status: "PROCESSING" | "SUCCESS" | "FAILED";
  message?: string;
  rawResponse: unknown;
}

export interface ProviderOrderStatus {
  providerOrderId: string;
  status: "PROCESSING" | "SUCCESS" | "FAILED";
  rawResponse: unknown;
}

export interface ProviderProduct {
  sku: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface ProductProviderAdapter {
  readonly name: string;
  createOrder(input: ProviderOrderInput): Promise<ProviderOrderResult>;
  checkOrder(providerOrderId: string): Promise<ProviderOrderStatus>;
  getProducts(): Promise<ProviderProduct[]>;
  getBalance(): Promise<number>;
}
