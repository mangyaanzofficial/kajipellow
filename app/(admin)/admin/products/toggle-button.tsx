"use client";

import { useActionState } from "react";
import { toggleProductActiveAction, type AdminActionState } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";

const initialState: AdminActionState = {};

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [, action] = useActionState(toggleProductActiveAction, initialState);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">
        <Badge variant={isActive ? "success" : "danger"}>{isActive ? "Aktif" : "Nonaktif"}</Badge>
      </button>
    </form>
  );
}
