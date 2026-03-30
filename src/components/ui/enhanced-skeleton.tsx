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
import { Users } from 'lucide-react';

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
 * Matches the actual dashboard layout: Attention items + Today's Schedule
 */
export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="animate-in fade-in-0 duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded bg-muted/30" />
          <div className="h-8 w-32 rounded bg-muted/30" />
        </div>
        <div className="h-4 w-40 rounded bg-muted/20" />
      </div>

      {/* Needs Attention Section */}
      <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2" style={{ animationDelay: '150ms', animationDuration: '300ms' }}>
        <div className="h-5 w-32 rounded bg-muted/30" />
        
        {/* Attention items - match AttentionList styling */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border-l-[3px]"
            style={{
              background: 'var(--status-pending-bg)',
              borderColor: 'var(--status-pending-border)',
              borderLeftColor: 'var(--status-pending-dot)',
              animationDelay: `${200 + i * 100}ms`,
            }}
          >
            <div className="w-4 h-4 rounded bg-muted/30 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-48 rounded bg-muted/30" />
              <div className="h-3 w-32 rounded bg-muted/20" />
            </div>
            <div className="w-4 h-4 rounded bg-muted/20 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Today's Schedule Section */}
      <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2" style={{ animationDelay: '400ms', animationDuration: '300ms' }}>
        <div className="h-5 w-36 rounded bg-muted/30" />
        
        {/* Schedule items - match TodaySchedule styling */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{
              background: 'var(--color-card)',
              borderColor: 'var(--color-primary)',
              animationDelay: `${500 + i * 100}ms`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted/30 flex-shrink-0" />
              <div className="space-y-1">
                <div className="h-4 w-28 rounded bg-muted/30" />
                <div className="h-3 w-20 rounded bg-muted/20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for just the Attention section
 */
export function SkeletonAttentionList({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="h-5 w-32 rounded bg-muted/30 animate-pulse" />
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border-l-[3px] animate-in fade-in-0"
          style={{
            background: 'var(--status-pending-bg)',
            borderColor: 'var(--status-pending-border)',
            borderLeftColor: 'var(--status-pending-dot)',
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="w-4 h-4 rounded bg-muted/30 flex-shrink-0 animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-48 rounded bg-muted/30 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for just the Today's Schedule section
 */
export function SkeletonTodaySchedule({ className, count = 3 }: { className?: string; count?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="h-5 w-36 rounded bg-muted/30 animate-pulse" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-lg border animate-in fade-in-0"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-primary)',
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-muted/30 flex-shrink-0 animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-16 rounded-full bg-muted/20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CLIENT DETAIL PANEL SKELETON
// ============================================================================

interface SkeletonClientDetailProps {
  className?: string;
}

/**
 * Skeleton for the client detail panel
 * Mimics the layout of ClientDetailPanel for instant visual feedback
 */
export function SkeletonClientDetail({ className }: SkeletonClientDetailProps) {
  return (
    <div className={cn('flex flex-col h-full min-h-0 bg-card overflow-hidden', className)}>
      {/* Handle for mobile */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted/40" />
      </div>
      
      {/* Accent bar */}
      <div className="h-[3px] w-full flex-shrink-0 bg-primary" />
      
      {/* Header skeleton */}
      <div className="p-4 border-b border-primary animate-in fade-in-0">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-16 rounded bg-muted/30" />
          <div className="w-6 h-6 rounded bg-muted/20" />
        </div>
        <div className="h-5 w-32 rounded bg-muted/30" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Client hero card */}
        <div 
          className="flex items-center gap-3 rounded-xl p-4 border animate-in fade-in-0 zoom-in-[0.98] duration-[var(--motion-duration-base)]"
          style={{ background: 'var(--color-semantic-accent-sage-subtle)', borderColor: 'var(--color-semantic-accent-sage)' }}
        >
          <div className="w-10 h-10 rounded-full bg-muted/30 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-muted/30" />
            <div className="h-3 w-20 rounded bg-muted/20" />
          </div>
        </div>
        
        {/* Contact section */}
        <div className="animate-in fade-in-0" style={{ animationDelay: '100ms' }}>
          <div className="mb-2 h-3 w-16 rounded bg-muted/30" />
          <div className="divide-y divide-primary/50">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 rounded bg-muted/20" />
                <div className="h-3 flex-1 rounded bg-muted/20" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Rate codes section */}
        <div className="animate-in fade-in-0" style={{ animationDelay: '200ms' }}>
          <div className="mb-2 h-3 w-20 rounded bg-muted/30" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted/20" />
            <div className="h-6 w-20 rounded-full bg-muted/20" />
            <div className="h-6 w-20 rounded-full bg-muted/20" />
          </div>
        </div>
        
        {/* Recent sessions section */}
        <div className="animate-in fade-in-0" style={{ animationDelay: '300ms' }}>
          <div className="mb-2 h-3 w-24 rounded bg-muted/30" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-primary/30">
                <div className="h-3 w-24 rounded bg-muted/20" />
                <div className="h-3 w-16 rounded bg-muted/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer buttons skeleton */}
      <div className="p-4 border-t border-primary animate-in fade-in-0" style={{ animationDelay: '400ms' }}>
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-muted/20" />
          <div className="h-10 w-10 rounded-lg bg-muted/20" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// APPOINTMENT DETAIL PANEL SKELETON
// ============================================================================

interface SkeletonAppointmentDetailProps {
  className?: string;
}

/**
 * Skeleton for the appointment/session detail panel
 * Mimics the ViewPanel layout for instant visual feedback
 */
export function SkeletonAppointmentDetail({ className }: SkeletonAppointmentDetailProps) {
  return (
    <div className={cn('flex flex-col h-full min-h-0 bg-card overflow-hidden', className)}>
      {/* Handle for mobile */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted/40" />
      </div>
      
      {/* Accent bar */}
      <div className="h-[3px] w-full flex-shrink-0 bg-primary" />
      
      {/* Header skeleton */}
      <div className="p-4 border-b border-primary animate-in fade-in-0">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-16 rounded bg-muted/30" />
          <div className="w-6 h-6 rounded bg-muted/20" />
        </div>
        <div className="h-5 w-28 rounded bg-muted/30" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Session hero card */}
        <div 
          className="flex items-center gap-3 rounded-xl p-4 border animate-in fade-in-0 zoom-in-[0.98] duration-[var(--motion-duration-base)]"
          style={{ background: 'var(--color-semantic-background-subtle)', borderColor: 'var(--color-semantic-border-default)' }}
        >
          <div className="w-10 h-10 rounded-full bg-muted/30 animate-pulse flex-shrink-0 flex items-center justify-center">
            <Users size={16} className="text-muted-foreground/50" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted/30" />
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded-full bg-muted/20" />
            </div>
          </div>
        </div>
        
        {/* Session details section */}
        <div className="animate-in fade-in-0" style={{ animationDelay: '100ms' }}>
          <div className="mb-2 h-3 w-16 rounded bg-muted/30" />
          <div className="divide-y divide-primary/50">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="h-3 w-12 rounded bg-muted/20" />
                <div className="h-3 w-24 rounded bg-muted/20" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Notes section placeholder */}
        <div className="animate-in fade-in-0 rounded-lg bg-soft-cream border border-primary p-3" style={{ animationDelay: '200ms' }}>
          <div className="mb-2 h-3 w-12 rounded bg-muted/30" />
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-muted/15" />
            <div className="h-3 w-3/4 rounded bg-muted/15" />
          </div>
        </div>
      </div>
      
      {/* Footer buttons skeleton */}
      <div className="p-4 border-t border-primary animate-in fade-in-0" style={{ animationDelay: '300ms' }}>
        <div className="space-y-2">
          <div className="h-10 w-full rounded-lg bg-muted/20" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-lg bg-muted/15" />
            <div className="h-10 flex-1 rounded-lg bg-muted/15" />
          </div>
        </div>
      </div>
    </div>
  );
}
