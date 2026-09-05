"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordAction, type ProfileActionState } from "@/actions/profile";

const initialState: ProfileActionState = {};

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="currentPassword" type="password" label="Password Saat Ini" required />
      <Input name="newPassword" type="password" label="Password Baru" required />
      <Input name="confirmNewPassword" type="password" label="Konfirmasi Password Baru" required />

      {state.error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>}
      {state.success && <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{state.success}</p>}

      <Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Ganti Password"}</Button>
    </form>
  );
}
