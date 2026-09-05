import "server-only";
import type { ProductProviderAdapter } from "@/services/provider/types";
import { MockProviderAdapter } from "@/services/provider/mock-provider.adapter";

/**
 * Factory untuk memilih product provider aktif berdasarkan kode provider di DB (Provider.code)
 * atau env PRODUCT_PROVIDER sebagai default. Tambah provider baru: buat adapter baru + case di sini.
 */
export function getProductProviderAdapter(providerCode: string): ProductProviderAdapter {
  switch (providerCode) {
    case "mock":
      return new MockProviderAdapter();
    // case "digiflazz":
    //   return new DigiflazzProviderAdapter();
    default:
      throw new Error(`Product provider "${providerCode}" belum didukung.`);
  }
}
