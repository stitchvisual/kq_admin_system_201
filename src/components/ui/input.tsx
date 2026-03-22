import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "pill" | "underline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default:
        "flex h-11 w-full rounded-md border border-input bg-[hsl(40,20%,98%)] px-4 py-2 text-base shadow-soft transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(130,13%,56%)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      pill:
        "flex h-11 w-full rounded-full border-0 bg-[hsl(35,15%,94%)] px-4 py-2 text-base shadow-soft transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(130,13%,56%)] focus-visible:bg-[hsl(40,20%,98%)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      underline:
        "flex h-11 w-full border-0 border-b border-[hsl(37,18%,89%)] bg-transparent px-1 py-2 text-base transition-all duration-300 ease-out placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-[hsl(130,13%,56%)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-none",
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
