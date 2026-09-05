import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getPopularProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { category: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, provider: true },
  });
}

export async function getProductsByCategory(categorySlug: string) {
  return prisma.product.findMany({
    where: { isActive: true, category: { slug: categorySlug } },
    orderBy: { sellPrice: "asc" },
    include: { category: true },
  });
}

/**
 * Statistik landing page. Nilai "userCount" & "transactionCount" dihitung real dari DB,
 * bukan angka hardcode, supaya jujur ke pengunjung (lihat aturan #40 — jangan buat fitur palsu).
 */
export async function getHomepageStats() {
  const [productCount, transactionSuccessCount, userCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
    prisma.user.count(),
  ]);

  return { productCount, transactionSuccessCount, userCount };
}
