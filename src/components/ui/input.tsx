import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "pill" | "underline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "flex h-11 w-full rounded-md border bg-[var(--color-semantic-background-base)] px-4 py-2 text-base shadow-card file:border-0 file:bg-transparent file:text-sm file:font-medium text-[var(--color-semantic-text-primary)] placeholder:text-[var(--color-semantic-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-semantic-brand-primary)] focus-visible:ring-offset-0 focus-visible:border-[var(--color-semantic-brand-primary)] focus-visible:shadow-input-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-default)]",
      pill:
        "flex h-11 w-full rounded-full border-0 bg-[var(--color-semantic-background-subtle)] px-4 py-2 text-base shadow-card file:border-0 file:bg-transparent file:text-sm file:font-medium text-[var(--color-semantic-text-primary)] placeholder:text-[var(--color-semantic-text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-semantic-brand-primary)] focus-visible:bg-[var(--color-semantic-background-base)] focus-visible:shadow-input-focus disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-default)]",
      underline:
        "flex h-11 w-full border-0 border-b-2 border-[var(--color-semantic-border-default)] bg-transparent px-1 py-2 text-base placeholder:text-[var(--color-semantic-text-tertiary)] focus-visible:outline-none focus-visible:border-[var(--color-semantic-brand-primary)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-none transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-easing-default)]",
    };

    return (
      <input
        type={type}
        className={cn(variantStyles[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
