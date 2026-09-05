"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { payDepositAction, type DepositActionState } from "@/actions/deposit";

const METHODS = [
  { value: "QRIS", label: "QRIS" },
  { value: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
  { value: "E_WALLET", label: "E-Wallet" },
  { value: "BANK_TRANSFER", label: "Transfer Bank" },
] as const;

const initialState: DepositActionState = {};

export function DepositPayForm({ depositId }: { depositId: string }) {
  const [selected, setSelected] = useState<string>("QRIS");
  const [state, formAction, isPending] = useActionState(payDepositAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="depositId" value={depositId} />
      <input type="hidden" name="method" value={selected} />

      <div className="grid grid-cols-2 gap-3">
        {METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelected(m.value)}
            className={cn(
              "rounded-xl border p-4 text-sm font-medium text-left transition-colors",
              selected === m.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/5"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {state.error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </form>
  );
}
