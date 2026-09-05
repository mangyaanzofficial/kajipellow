import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-brand text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110",
        secondary: "bg-white/10 text-foreground border border-border hover:bg-white/15",
        ghost: "text-foreground hover:bg-white/10",
        danger: "bg-danger text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
