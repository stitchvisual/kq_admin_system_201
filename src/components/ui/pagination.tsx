import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

interface PaginationLinkProps {
  isActive?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

const PaginationLink = ({
  isActive,
  onClick,
  children,
}: PaginationLinkProps) => (
  <Button
    variant={isActive ? "default" : "outline"}
    size="icon"
    className={cn(
      "h-9 w-9",
      isActive && "bg-primary text-primary-foreground"
    )}
    onClick={onClick}
  >
    {children}
  </Button>
);
PaginationLink.displayName = "PaginationLink";

interface PaginationNavProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: React.ReactNode;
}

const PaginationPrevious = ({ onClick, disabled, children }: PaginationNavProps) => (
  <PaginationItem>
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="gap-1 pl-2.5"
    >
      {children}
    </Button>
  </PaginationItem>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ onClick, disabled, children }: PaginationNavProps) => (
  <PaginationItem>
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="gap-1 pr-2.5"
    >
      {children}
    </Button>
  </PaginationItem>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};