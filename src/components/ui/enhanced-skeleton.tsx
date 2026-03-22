/**
 * Enhanced Skeleton Components
 * ============================
 *
 * Composite skeleton components for loading states.
 * Base skeleton variants are re-exported from @/components/botanical.
 *
 * @example
 * // For simple loading states
 * import { Skeleton } from '@/components/botanical';
 *
 * // For dashboard loading states
 * import { SkeletonDashboard } from '@/components/ui/enhanced-skeleton';
 */

import { cn } from '@/lib/utils';

// ============================================================================
// RE-EXPORTS FROM BOTANICAL
// ============================================================================

// Re-export all skeleton variants from botanical for backward compatibility
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonRow,
  SkeletonCell,
  SkeletonGrid,
  SkeletonAppointmentCard,
  SkeletonInvoiceItem,
  SkeletonClientRow,
} from '@/components/botanical';

// ============================================================================
// COMPOSITE SKELETONS
// ============================================================================

interface SkeletonStatCardProps {
  /** Number of stat cards to display */
  count?: number;
  className?: string;
}

/**
 * Stat card skeleton for dashboard views
 * Displays placeholder cards in a responsive grid
 */
export function SkeletonStatCard({ count = 4, className }: SkeletonStatCardProps) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4', className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in-0 rounded-xl border bg-card p-5"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="mb-2 h-4 w-20 rounded bg-muted/30" />
          <div className="mb-3 h-6 w-32 rounded bg-muted/30" />
          <div className="h-3 w-24 rounded bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns */
  cols?: number;
  className?: string;
}

/**
 * Table skeleton with configurable dimensions
 * Displays header row and data row placeholders
 */
export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header row */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 w-20 rounded bg-muted/30" />
        ))}
      </div>
      
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 animate-in fade-in-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            animationDelay: `${rowIndex * 100}ms`,
          }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-5 rounded bg-muted/20" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonDashboardProps {
  className?: string;
}

/**
 * Full dashboard skeleton with all sections
 * Staggered animation for progressive disclosure effect
 */
export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="animate-in fade-in-0">
        <div className="mb-2 h-8 w-64 rounded bg-muted/30" />
        <div className="h-4 w-32 rounded bg-muted/20" />
      </div>

      {/* Stat Cards */}
      <div className="animate-in fade-in-0" style={{ animationDelay: '200ms' }}>
        <SkeletonStatCard count={4} />
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="animate-in fade-in-0" style={{ animationDelay: '600ms' }}>
          <div className="mb-4 h-6 w-32 rounded bg-muted/30" />
          <SkeletonTable rows={3} />
        </div>
        <div className="animate-in fade-in-0" style={{ animationDelay: '800ms' }}>
          <div className="mb-4 h-6 w-32 rounded bg-muted/30" />
          <SkeletonTable rows={3} />
        </div>
      </div>
    </div>
  );
}
