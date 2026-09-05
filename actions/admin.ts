"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { upsertProductSchema, updateUserRoleSchema, updateUserStatusSchema } from "@/types/admin";
import { processProductDelivery } from "@/services/transaction/transaction.service";

export type AdminActionState = { error?: string; success?: string };

// ---------- USER MANAGEMENT ----------

export async function updateUserRoleAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = updateUserRoleSchema.safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!parsed.success) return { error: "Data tidak valid." };

  if (parsed.data.userId === admin.id) return { error: "Anda tidak dapat mengubah role akun sendiri." };

  await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } });
  revalidatePath("/admin/users");
  return { success: "Role user berhasil diperbarui." };
}

export async function updateUserStatusAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = updateUserStatusSchema.safeParse({ userId: formData.get("userId"), status: formData.get("status") });
  if (!parsed.success) return { error: "Data tidak valid." };

  if (parsed.data.userId === admin.id) return { error: "Anda tidak dapat mengubah status akun sendiri." };

  await prisma.user.update({ where: { id: parsed.data.userId }, data: { status: parsed.data.status } });
  // Kalau di-suspend/ban, revoke semua session aktif user tersebut
  if (parsed.data.status !== "ACTIVE") {
    await prisma.session.deleteMany({ where: { userId: parsed.data.userId } });
  }
  revalidatePath("/admin/users");
  return { success: "Status user berhasil diperbarui." };
}

// CATATAN KEAMANAN (brief poin #16):
// Admin SENGAJA tidak diberi action untuk mengubah password user secara langsung.
// Jika user lupa password, alur yang benar adalah lewat reset password terverifikasi
// (email/OTP) — bukan admin men-set password baru secara manual.

// ---------- PRODUCT MANAGEMENT ----------

export async function upsertProductAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = upsertProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const { id, ...data } = parsed.data;

  try {
    if (id) {
      await prisma.product.update({ where: { id }, data });
    } else {
      await prisma.product.create({ data });
    }
  } catch (err) {
    console.error("upsertProductAction error:", err);
    return { error: "Gagal menyimpan produk. Pastikan slug unik." };
  }

  revalidatePath("/admin/products");
  return { success: "Produk berhasil disimpan." };
}

export async function toggleProductActiveAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: "Produk tidak ditemukan." };

  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/products");
  return { success: "Status produk berhasil diperbarui." };
}

// ---------- TRANSACTION MANAGEMENT ----------

export async function retryTransactionAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) return { error: "Transaksi tidak ditemukan." };
  if (transaction.status !== "FAILED" && transaction.status !== "PROCESSING") {
    return { error: "Hanya transaksi FAILED/PROCESSING yang bisa di-retry." };
  }

  await prisma.transaction.update({ where: { id }, data: { status: "PAID", failureReason: null } });
  await processProductDelivery(id);

  revalidatePath("/admin/transactions");
  return { success: "Transaksi berhasil di-retry." };
}

// ---------- SYSTEM SETTINGS ----------

export async function updateSystemSettingAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  if (!key) return { error: "Key setting tidak valid." };

  await prisma.systemSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/admin/settings");
  return { success: "Pengaturan berhasil disimpan." };
}
