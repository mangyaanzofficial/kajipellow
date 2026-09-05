"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createOrderAction, type OrderActionState } from "@/actions/order";

const initialState: OrderActionState = {};

export function OrderForm({ productId, requiresServerId }: { productId: string; requiresServerId: boolean }) {
  const [state, formAction, isPending] = useActionState(createOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <Input name="targetNumber" label="User ID / Nomor Tujuan" placeholder="Masukkan User ID atau nomor HP" required />
      {requiresServerId && <Input name="targetServerId" label="Server ID" placeholder="Masukkan Server ID" required />}

      {state.error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Memproses..." : "Lanjutkan Pembayaran"}
      </Button>
    </form>
  );
}
