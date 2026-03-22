import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-caps uppercase transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-[hsl(145,15%,20%)] text-white shadow-soft hover:bg-[hsl(145,15%,25%)] hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "rounded-md border border-[hsl(130_13%_62%)] bg-[hsl(130_13%_50%/0.10)] text-[hsl(130_13%_32%)] hover:bg-[hsl(130_13%_50%/0.18)] hover:border-[hsl(130_13%_50%)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "rounded-md bg-mutedBg text-[hsl(145,15%,20%)] shadow-soft hover:bg-mutedBg/90 hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
        ghost: "rounded-md hover:bg-[hsl(130,13%,56%)]/10 hover:text-[hsl(130,13%,56%)]",
        link: "text-[hsl(130,13%,56%)] underline-offset-4 hover:underline hover:text-[hsl(12,47%,58%)]",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-11 w-11 rounded-md",
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
