"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/guards";
import { createDeposit, initiateDepositPayment, DepositError } from "@/services/wallet/deposit.service";

export type DepositActionState = { error?: string };

const createDepositSchema = z.object({ amount: z.coerce.number().int().positive() });

export async function createDepositAction(_prev: DepositActionState, formData: FormData): Promise<DepositActionState> {
  const user = await requireUser();
  const parsed = createDepositSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) return { error: "Nominal tidak valid." };

  let depositId: string;
  try {
    const deposit = await createDeposit({ userId: user.id, amount: parsed.data.amount, idempotencyKey: randomUUID() });
    depositId = deposit.id;
  } catch (err) {
    if (err instanceof DepositError) return { error: err.message };
    console.error("createDepositAction error:", err);
    return { error: "Terjadi kesalahan server." };
  }

  redirect(`/dashboard/deposit/${depositId}`);
}

const paySchema = z.object({
  depositId: z.string().min(1),
  method: z.enum(["QRIS", "VIRTUAL_ACCOUNT", "E_WALLET", "BANK_TRANSFER"]),
});

export async function payDepositAction(_prev: DepositActionState, formData: FormData): Promise<DepositActionState> {
  const user = await requireUser();
  const parsed = paySchema.safeParse({ depositId: formData.get("depositId"), method: formData.get("method") });
  if (!parsed.success) return { error: "Data tidak valid." };

  try {
    await initiateDepositPayment(parsed.data.depositId, parsed.data.method, user.name);
  } catch (err) {
    if (err instanceof DepositError) return { error: err.message };
    console.error("payDepositAction error:", err);
    return { error: "Terjadi kesalahan server." };
  }

  redirect(`/dashboard/deposit/${parsed.data.depositId}`);
}
