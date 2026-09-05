import { getAdminProducts } from "@/services/admin/admin.service";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { ToggleActiveButton } from "./toggle-button";
import { ProductForm } from "./product-form";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const { search, page } = await searchParams;
  const [result, categories, providers] = await Promise.all([
    getAdminProducts({ search, page: page ? Number(page) : 1 }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

      <details className="mb-6">
        <summary className="cursor-pointer font-medium text-primary mb-3">+ Tambah Produk Baru</summary>
        <Card className="p-6 mt-3">
          <ProductForm categories={categories} providers={providers} />
        </Card>
      </details>

      <form method="get" className="mb-4 max-w-sm">
        <Input name="search" defaultValue={search} placeholder="Cari produk..." />
      </form>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-4">Produk</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Harga Provider</th>
              <th className="p-4">Harga Jual</th>
              <th className="p-4">Profit</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.provider.name}</p>
                </td>
                <td className="p-4">{p.category.name}</td>
                <td className="p-4"><PriceDisplay amount={p.costPrice} /></td>
                <td className="p-4"><PriceDisplay amount={p.sellPrice} /></td>
                <td className="p-4 text-success"><PriceDisplay amount={p.sellPrice - p.costPrice} /></td>
                <td className="p-4"><ToggleActiveButton id={p.id} isActive={p.isActive} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
