"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Masuk ke akun Anda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Input name="identifier" label="Email atau Username" placeholder="you@email.com" required />
        <Input name="password" type="password" label="Password" placeholder="••••••••" required />

        {state.error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
