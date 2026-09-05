"use client";

import { useActionState } from "react";
import { retryTransactionAction, type AdminActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

export function RetryButton({ id }: { id: string }) {
  const [state, action, isPending] = useActionState(retryTransactionAction, initialState);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="secondary" disabled={isPending}>
        {isPending ? "..." : "Retry"}
      </Button>
      {state.error && <p className="text-xs text-danger mt-1">{state.error}</p>}
    </form>
  );
}
