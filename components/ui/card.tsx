import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white/5 backdrop-blur-xl shadow-lg transition-shadow hover:shadow-xl",
        className
      )}
      {...props}
    />
  );
}
