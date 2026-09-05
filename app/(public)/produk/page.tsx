import { getActiveCategories, getProductsByCategory, getPopularProducts } from "@/services/product/product.service";
import { ProductCard } from "@/components/shared/product-card";
import Link from "next/link";
import { cn } from "@/lib/cn";

export const metadata = { title: "Semua Produk" };

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const categories = await getActiveCategories();
  const products = kategori ? await getProductsByCategory(kategori) : await getPopularProducts(24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Semua Produk</h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <Link
          href="/produk"
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm border border-border",
            !kategori ? "bg-gradient-brand text-white border-transparent" : "bg-white/5 text-muted-foreground"
          )}
        >
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/produk?kategori=${c.slug}`}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm border border-border",
              kategori === c.slug ? "bg-gradient-brand text-white border-transparent" : "bg-white/5 text-muted-foreground"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada produk pada kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              categoryName={p.category.name}
              price={p.sellPrice + p.adminFee}
            />
          ))}
        </div>
      )}
    </div>
  );
}
