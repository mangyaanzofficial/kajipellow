import { z } from "zod";

export const upsertProductSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  providerId: z.string().min(1, "Provider wajib dipilih"),
  providerSku: z.string().min(1, "SKU provider wajib diisi"),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  costPrice: z.coerce.number().int().nonnegative(),
  sellPrice: z.coerce.number().int().nonnegative(),
  adminFee: z.coerce.number().int().nonnegative().default(0),
  requiresServerId: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
});
