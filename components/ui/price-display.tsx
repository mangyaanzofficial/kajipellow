import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/cn";

export function PriceDisplay({ amount, className }: { amount: number; className?: string }) {
  return <span className={cn("font-semibold tabular-nums", className)}>{formatCurrency(amount)}</span>;
}
