"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction, type ProfileActionState } from "@/actions/profile";

const initialState: ProfileActionState = {};

export function ProfileForm({ name, phone, email, username }: { name: string; phone: string; email: string; username: string }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Username" value={username} disabled />
      <Input label="Email" value={email} disabled />
      <Input name="name" label="Nama Lengkap" defaultValue={name} required />
      <Input name="phone" label="Nomor HP" defaultValue={phone} required />

      {state.error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>}
      {state.success && <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{state.success}</p>}

      <Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button>
    </form>
  );
}
