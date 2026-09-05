import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(100),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
    email: z.string().trim().toLowerCase().email("Email tidak valid"),
    phone: z
      .string()
      .trim()
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor HP tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar")
      .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Email/username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
