import Link from "next/link";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function CategoryCard({ slug, name, icon }: { slug: string; name: string; icon?: string | null }) {
  const IconComp = (icon && (Icons as unknown as Record<string, Icons.LucideIcon>)[icon]) || Icons.Package;
  return (
    <Link href={`/produk?kategori=${slug}`}>
      <Card className="p-5 flex flex-col items-center gap-3 text-center hover:border-primary/50 hover:-translate-y-1 transition-all duration-200">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center")}>
          <IconComp className="text-white" size={22} />
        </div>
        <span className="text-sm font-medium">{name}</span>
      </Card>
    </Link>
  );
}
