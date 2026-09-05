import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/produk`, lastModified: new Date() },
    { url: `${baseUrl}/bantuan`, lastModified: new Date() },
    ...products.map((p) => ({ url: `${baseUrl}/produk/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
