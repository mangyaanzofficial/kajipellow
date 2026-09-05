import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor HP tidak valid"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .regex(/[A-Z]/, "Harus mengandung huruf besar")
      .regex(/[0-9]/, "Harus mengandung angka"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmNewPassword"],
  });
