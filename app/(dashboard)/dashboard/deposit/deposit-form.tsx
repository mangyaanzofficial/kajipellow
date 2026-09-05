"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/utils/currency";
import { createDepositAction, type DepositActionState } from "@/actions/deposit";

const PRESETS = [10_000, 20_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
const initialState: DepositActionState = {};

export function DepositForm() {
  const [amount, setAmount] = useState<number | "">("");
  const [state, formAction, isPending] = useActionState(createDepositAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setAmount(p)}
            className={cn(
              "rounded-xl border p-3 text-sm font-medium",
              amount === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/5"
            )}
          >
            {formatCurrency(p)}
          </button>
        ))}
      </div>

      <Input
        name="amount"
        type="number"
        label="Atau masukkan nominal custom"
        min={10000}
        value={amount}
        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
        required
      />

      {state.error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending || !amount}>
        {isPending ? "Memproses..." : "Lanjutkan Deposit"}
      </Button>
    </form>
  );
}
