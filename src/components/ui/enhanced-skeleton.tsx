/**
 * Enhanced Skeleton Components
 * ============================
 *
 * Composite skeleton components for loading states.
 *
 * @example
 * import { SkeletonDashboard } from '@/components/ui/enhanced-skeleton';
 */

import { cn } from '@/lib/utils';

// ============================================================================
// COMPOSITE SKELETONS
// ============================================================================

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

      {/* Attention + Today Sections */}
      <div className="space-y-6">
        <div className="animate-in fade-in-0" style={{ animationDelay: '200ms' }}>
          <div className="mb-4 h-6 w-36 rounded bg-muted/30" />
          <SkeletonTable rows={2} />
        </div>
        <div className="animate-in fade-in-0" style={{ animationDelay: '400ms' }}>
          <div className="mb-4 h-6 w-40 rounded bg-muted/30" />
          <SkeletonTable rows={4} />
        </div>
      </div>
    </div>
  );
}
