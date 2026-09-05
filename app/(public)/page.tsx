import Link from "next/link";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/shared/category-card";
import { ProductCard } from "@/components/shared/product-card";
import { getActiveCategories, getPopularProducts, getHomepageStats } from "@/services/product/product.service";
import { FEATURES, HOW_IT_WORKS, FAQ } from "@/config/site";

export default async function HomePage() {
  const [categories, products, stats] = await Promise.all([
    getActiveCategories(),
    getPopularProducts(8),
    getHomepageStats(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand opacity-10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight animate-fade-in">
            <span className="bg-gradient-brand bg-clip-text text-transparent">SANTANIC</span> TOPUP & PPOB
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground animate-fade-in">
            Top Up Cepat, Aman & Terpercaya
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground animate-fade-in">
            Temukan berbagai kebutuhan digital dalam satu platform. Top up game, pulsa, paket data,
            e-wallet, token PLN, dan produk digital lainnya dengan proses cepat.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up">
            <Link href="/produk"><Button size="lg">Mulai Top Up</Button></Link>
            <Link href="/login"><Button size="lg" variant="secondary">Login / Daftar</Button></Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Produk Tersedia", value: stats.productCount },
              { label: "Transaksi Berhasil", value: stats.transactionSuccessCount },
              { label: "User Terdaftar", value: stats.userCount },
              { label: "Support", value: "24/7" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">Kategori Populer</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} slug={c.slug} name={c.name} icon={c.icon} />
          ))}
        </div>
      </section>

      {/* PRODUK POPULER */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold mb-6">Produk Populer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} slug={p.slug} name={p.name} categoryName={p.category.name} price={p.sellPrice + p.adminFee} />
            ))}
          </div>
        </section>
      )}

      {/* CARA KERJA */}
      <section id="cara-kerja" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Cara Kerja</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white">
                {s.step}
              </div>
              <h3 className="font-medium mt-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Keunggulan Kami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[f.icon] || Icons.Star;
            return (
              <div key={f.title} className="p-6 rounded-2xl border border-border bg-white/5">
                <Icon className="text-primary mb-3" size={24} />
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Pertanyaan Umum</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-border bg-white/5 p-4">
              <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                {item.q}
                <Icons.ChevronDown className="transition-transform group-open:rotate-180" size={18} />
              </summary>
              <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
