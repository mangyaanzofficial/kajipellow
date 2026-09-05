import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product/product.service";
import { PriceDisplay } from "@/components/ui/price-display";
import { Card } from "@/components/ui/card";
import { OrderForm } from "./order-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `Top up ${product.name} cepat dan aman di SANTANIC TOPUP & PPOB.`,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const totalPrice = product.sellPrice + product.adminFee;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">{product.category.name}</p>
      <h1 className="text-2xl font-bold mt-1">{product.name}</h1>

      <Card className="p-6 mt-6">
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-muted-foreground">Harga Produk</span>
          <PriceDisplay amount={product.sellPrice} />
        </div>
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="text-muted-foreground">Biaya Admin</span>
          <PriceDisplay amount={product.adminFee} />
        </div>
        <div className="flex justify-between items-center border-t border-border pt-4">
          <span className="font-medium">Total</span>
          <PriceDisplay amount={totalPrice} className="text-lg text-primary" />
        </div>
      </Card>

      <Card className="p-6 mt-6">
        <OrderForm productId={product.id} requiresServerId={product.requiresServerId} />
      </Card>
    </div>
  );
}
