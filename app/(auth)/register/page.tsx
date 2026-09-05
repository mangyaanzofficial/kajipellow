"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Buat akun baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Input name="name" label="Nama Lengkap" required />
        <Input name="username" label="Username" required />
        <Input name="email" type="email" label="Email" required />
        <Input name="phone" label="Nomor HP" placeholder="08xxxxxxxxxx" required />
        <Input name="password" type="password" label="Password" required />
        <Input name="confirmPassword" type="password" label="Konfirmasi Password" required />

        {state.error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Memproses..." : "Daftar"}
        </Button>
      </form>
    </div>
  );
}
