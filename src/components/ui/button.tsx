import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-caps uppercase transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Primary brand button using terracotta tokens
        default:
          "rounded-md bg-[var(--color-semantic-brand-primary)] text-white shadow-button hover:bg-[var(--color-semantic-brand-hover)] hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground shadow-button hover:bg-destructive/90 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
        // Outline using brand-muted (terracotta) for border
        outline:
          "rounded-md border border-[var(--color-semantic-brand-muted)] bg-[var(--color-semantic-brand-primary)]/10 text-[var(--color-semantic-brand-primary)] hover:bg-[var(--color-semantic-brand-primary)]/18 hover:border-[var(--color-semantic-brand-primary)] hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
        // Secondary using subtle background
        secondary:
          "rounded-md bg-[var(--color-semantic-background-subtle)] text-[var(--color-semantic-text-primary)] shadow-button hover:bg-[var(--color-semantic-background-muted)] hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
        // Ghost using sage accent for subtle hover
        ghost: "rounded-md hover:bg-[var(--color-semantic-accent-sage)]/10 hover:text-[var(--color-semantic-accent-sage)] active:scale-[0.98] duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-default)]",
        // Link using brand colors
        link: "text-[var(--color-semantic-brand-primary)] underline-offset-4 hover:underline hover:text-[var(--color-semantic-brand-hover)] duration-[var(--motion-duration-fast)]",
        // Premium gradient using brand colors
        premium:
          "rounded-md bg-gradient-to-b from-[var(--color-semantic-brand-primary)] to-[color-mix(in_oklab,var(--color-semantic-brand-primary),black_15%)] text-white shadow-button hover:from-[var(--color-semantic-brand-hover)] hover:to-[color-mix(in_oklab,var(--color-semantic-brand-hover),black_10%)] hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)] [&::before]:content-[''] [&::before]:absolute [&::before]:inset-0 [&::before]:rounded-md [&::before]:bg-gradient-to-b [&::before]:from-white/[0.12] [&::before]:to-transparent [&::before]:opacity-0 hover:[&::before]:opacity-100 [&::before]:transition-opacity [&::before]:duration-[var(--motion-duration-fast)]",
        // Success using sage accent
        success:
          "rounded-md bg-[var(--color-semantic-accent-sage)] text-white shadow-button hover:brightness-1.1 hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
        // Warning using brand-muted (warm terracotta)
        warning:
          "rounded-md bg-[var(--color-semantic-brand-muted)] text-white shadow-button hover:bg-[var(--color-semantic-brand-primary)] hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] duration-[var(--motion-duration-base)] ease-[var(--motion-easing-default)]",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-11 w-11 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
