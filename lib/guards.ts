import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

/**
 * Dipanggil di layout.tsx dashboard. Validasi PENUH (cek DB) dilakukan di sini,
 * bukan hanya di middleware, karena middleware hanya cek keberadaan cookie.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
