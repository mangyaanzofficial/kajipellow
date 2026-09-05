"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSystemSettingAction, type AdminActionState } from "@/actions/admin";

const initialState: AdminActionState = {};

export function SettingForm({ settingKey, label, value }: { settingKey: string; label: string; value: string }) {
  const [state, action, isPending] = useActionState(updateSystemSettingAction, initialState);
  return (
    <form action={action} className="flex items-end gap-3">
      <input type="hidden" name="key" value={settingKey} />
      <div className="flex-1">
        <Input name="value" label={label} defaultValue={value} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>{isPending ? "..." : "Simpan"}</Button>
      {state.success && <span className="text-xs text-success self-center">Tersimpan</span>}
    </form>
  );
}
