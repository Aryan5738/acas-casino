import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold-500/40 bg-gold-500/15 text-gold-300",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
        destructive: "border-red-500/40 bg-red-500/15 text-red-400",
        outline: "border-white/15 text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
