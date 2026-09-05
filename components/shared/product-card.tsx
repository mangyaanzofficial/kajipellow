import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/ui/price-display";

export function ProductCard({
  slug,
  name,
  categoryName,
  price,
}: {
  slug: string;
  name: string;
  categoryName: string;
  price: number;
}) {
  return (
    <Link href={`/produk/${slug}`}>
      <Card className="p-4 h-full flex flex-col justify-between hover:border-primary/50 hover:-translate-y-1 transition-all duration-200 animate-slide-up">
        <div>
          <p className="text-xs text-muted-foreground">{categoryName}</p>
          <h3 className="font-medium text-sm mt-1 line-clamp-2">{name}</h3>
        </div>
        <PriceDisplay amount={price} className="mt-3 text-primary" />
      </Card>
    </Link>
  );
}
