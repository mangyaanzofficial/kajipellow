"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { registerSchema, loginSchema } from "@/types/auth";
import { registerUser, authenticateUser, AuthError } from "@/services/auth/auth.service";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export type ActionState = { error?: string; success?: boolean };

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getClientIp();
  const rl = rateLimit(`register:${ip}`, RATE_LIMITS.REGISTER.limit, RATE_LIMITS.REGISTER.windowMs);
  if (!rl.success) {
    return { error: "Terlalu banyak percobaan registrasi. Coba lagi beberapa saat lagi." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    const user = await registerUser(parsed.data);
    const h = await headers();
    await createSession(user.id, { userAgent: h.get("user-agent") ?? undefined, ipAddress: ip });
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error("registerAction error:", err);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }

  redirect("/dashboard");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await getClientIp();
  const rl = rateLimit(`login:${ip}`, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowMs);
  if (!rl.success) {
    return { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." };
  }

  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    const user = await authenticateUser(parsed.data);
    const h = await headers();
    await createSession(user.id, { userAgent: h.get("user-agent") ?? undefined, ipAddress: ip });
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error("loginAction error:", err);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
