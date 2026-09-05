"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/session";
import { createProductOrder, TransactionError } from "@/services/transaction/transaction.service";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { headers } from "next/headers";

export type OrderActionState = { error?: string };

const orderSchema = z.object({
  productId: z.string().min(1),
  targetNumber: z.string().trim().min(3, "User ID/nomor tujuan wajib diisi"),
  targetServerId: z.string().trim().optional(),
});

export async function createOrderAction(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`order:${ip}`, RATE_LIMITS.ORDER_CREATE.limit, RATE_LIMITS.ORDER_CREATE.windowMs);
  if (!rl.success) return { error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." };

  const parsed = orderSchema.safeParse({
    productId: formData.get("productId"),
    targetNumber: formData.get("targetNumber"),
    targetServerId: formData.get("targetServerId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const user = await getCurrentUser();

  let transactionId: string;
  try {
    // idempotencyKey unik per-submit form (dibuat di server, bukan dikirim client)
    // sehingga double-click tidak membuat 2 transaksi berbeda dalam window pendek ini
    // tidak sepenuhnya mencegah 2x klik terpisah, tapi dikombinasikan dengan rate limit di atas.
    const transaction = await createProductOrder({
      userId: user?.id,
      productId: parsed.data.productId,
      targetNumber: parsed.data.targetNumber,
      targetServerId: parsed.data.targetServerId,
      idempotencyKey: randomUUID(),
    });
    transactionId = transaction.id;
  } catch (err) {
    if (err instanceof TransactionError) return { error: err.message };
    console.error("createOrderAction error:", err);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }

  redirect(`/checkout/${transactionId}`);
}
