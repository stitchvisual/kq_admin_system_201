import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Premium Skeleton Component
 *
 * Provides elegant loading placeholders with shimmer effects.
 * Uses CSS variables for theming and reduced motion support.
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined skeleton variant */
  variant?: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'thumbnail';
  /** Width override (CSS value) */
  width?: string;
  /** Height override (CSS value) */
  height?: string;
  /** Enable animated shimmer effect */
  shimmer?: boolean;
  /** Circular skeleton (for avatars) */
  circular?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant = 'text', width, height, shimmer = true, circular, style, ...props },
    ref,
  ) => {
    // Variant-based default sizes
    const variantStyles: Record<string, string> = {
      text: 'h-4 w-full',
      title: 'h-6 w-3/5',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-11 w-24 rounded-md',
      card: 'h-48 w-full rounded-lg',
      thumbnail: 'h-20 w-20 rounded-md',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden',
          // Shimmer animation
          shimmer && 'skeleton-premium',
          // Variant styles (only if no custom dimensions)
          !width && !height && variantStyles[variant],
          // Circular override
          circular && 'rounded-full',
          // Default rounded
          !circular &&
            variant !== 'avatar' &&
            variant !== 'button' &&
            variant !== 'card' &&
            variant !== 'thumbnail' &&
            'rounded',
          className,
        )}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';

/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton Presets
   ───────────────────────────────────────────────────────────────────────────── */

/** Skeleton for text lines */
function SkeletonText({
  lines = 3,
  className,
  ...props
}: { lines?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : undefined} {...props} />
      ))}
    </div>
  );
}

/** Skeleton for card with header, content, and footer */
function SkeletonCard({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-4 p-[var(--spacing-6)]', className)}>
      <div className="flex items-center gap-[var(--spacing-3)]">
        <Skeleton variant="avatar" {...props} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" {...props} />
          <Skeleton variant="text" width="60%" {...props} />
        </div>
      </div>
      <Skeleton variant="card" height="120px" {...props} />
      <div className="space-y-2">
        <Skeleton variant="text" {...props} />
        <Skeleton variant="text" width="80%" {...props} />
      </div>
    </div>
  );
}

/** Skeleton for list items */
function SkeletonList({
  items = 5,
  className,
  ...props
}: { items?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-[var(--spacing-3)]">
          <Skeleton variant="avatar" {...props} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="30%" {...props} />
            <Skeleton variant="text" width="50%" {...props} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for table rows */
function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: { rows?: number; columns?: number } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-[var(--spacing-4)] pb-[var(--spacing-3)] border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} {...props} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-[var(--spacing-4)] py-[var(--spacing-2)]">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} {...props} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Skeleton for invoice/document */
function SkeletonInvoice({ className, ...props }: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton variant="title" width="150px" {...props} />
          <Skeleton variant="text" width="100px" {...props} />
        </div>
        <Skeleton variant="text" width="80px" {...props} />
      </div>
      {/* Details */}
      <div className="grid grid-cols-2 gap-[var(--spacing-4)]">
        <div className="space-y-2">
          <Skeleton variant="text" width="60%" {...props} />
          <Skeleton variant="text" width="80%" {...props} />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="60%" {...props} />
          <Skeleton variant="text" width="80%" {...props} />
        </div>
      </div>
      {/* Table */}
      <SkeletonTable rows={4} columns={4} {...props} />
      {/* Total */}
      <div className="flex justify-end">
        <div className="space-y-2 w-48">
          <Skeleton variant="text" {...props} />
          <Skeleton variant="text" width="60%" {...props} />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonList, SkeletonTable, SkeletonInvoice };
