"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { initiatePayment, TransactionError } from "@/services/transaction/transaction.service";

export type PaymentActionState = { error?: string };

const paymentSchema = z.object({
  transactionId: z.string().min(1),
  method: z.enum(["QRIS", "VIRTUAL_ACCOUNT", "E_WALLET", "BANK_TRANSFER"]),
});

export async function initiatePaymentAction(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const parsed = paymentSchema.safeParse({
    transactionId: formData.get("transactionId"),
    method: formData.get("method"),
  });

  if (!parsed.success) return { error: "Metode pembayaran tidak valid." };

  const user = await getCurrentUser();

  try {
    await initiatePayment(parsed.data.transactionId, parsed.data.method, user?.name ?? "Guest");
  } catch (err) {
    if (err instanceof TransactionError) return { error: err.message };
    console.error("initiatePaymentAction error:", err);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }

  redirect(`/invoice/${parsed.data.transactionId}`);
}
