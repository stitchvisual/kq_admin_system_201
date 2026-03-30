import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary brand badge using terracotta tokens
        default:
          "border-transparent bg-[var(--color-semantic-brand-primary)] text-white shadow hover:bg-[var(--color-semantic-brand-hover)]",
        // Secondary using subtle background
        secondary:
          "border-transparent bg-[var(--color-semantic-background-subtle)] text-[var(--color-semantic-text-secondary)] hover:bg-[var(--color-semantic-background-muted)]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        // Outline using brand color
        outline: "text-[var(--color-semantic-brand-primary)] border-[var(--color-semantic-brand-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
