"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { updateProfileSchema, changePasswordSchema } from "@/types/profile";

export type ProfileActionState = { error?: string; success?: string };

export async function updateProfileAction(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const user = await requireUser();
  const parsed = updateProfileSchema.safeParse({ name: formData.get("name"), phone: formData.get("phone") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const phoneTaken = await prisma.user.findFirst({ where: { phone: parsed.data.phone, NOT: { id: user.id } } });
  if (phoneTaken) return { error: "Nomor HP sudah digunakan akun lain." };

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/dashboard/profil");
  return { success: "Profil berhasil diperbarui." };
}

export async function changePasswordAction(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const fullUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const valid = await verifyPassword(parsed.data.currentPassword, fullUser.passwordHash);
  if (!valid) return { error: "Password saat ini salah." };

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  // Revoke semua session lain demi keamanan setelah ganti password
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return { success: "Password berhasil diganti. Silakan login ulang." };
}
