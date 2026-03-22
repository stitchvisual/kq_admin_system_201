"use client"

import React from 'react';
import { radii } from '@/styles/botanical';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface SkeletonBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base skeleton component with shimmer effect
 */
function Skeleton({ className, style, ...props }: SkeletonBaseProps) {
  const { skeleton } = useThemeColors()
  
  return (
    <div
      className={className}
      style={{
        borderRadius: skeleton.base.borderRadius,
        background: `linear-gradient(90deg, ${skeleton.shimmerStart} 25%, ${skeleton.shimmerMiddle} 50%, ${skeleton.shimmerEnd} 75%)`,
        backgroundSize: '200% 100%',
        animation: `shimmer ${skeleton.shimmerDuration} infinite`,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  const { skeleton } = useThemeColors()
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          style={{
            ...skeleton.text,
            width: i === lines - 1 ? '60%' : '80%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for circular avatar
 */
export function SkeletonAvatar({ className }: { className?: string }) {
  const { skeleton } = useThemeColors()
  return <Skeleton style={skeleton.avatar} className={className} />;
}

/**
 * Skeleton for button shape
 */
export function SkeletonButton({ className }: { className?: string }) {
  const { skeleton } = useThemeColors()
  return <Skeleton style={skeleton.button} className={className} />;
}

/**
 * Skeleton for card placeholder
 */
export function SkeletonCard({ className }: { className?: string }) {
  const { skeleton } = useThemeColors()
  return <Skeleton style={skeleton.card} className={className} />;
}

/**
 * Skeleton for table/list row
 */
export function SkeletonRow({ className }: { className?: string }) {
  const { skeleton } = useThemeColors()
  return <Skeleton style={skeleton.row} className={className} />;
}

/**
 * Skeleton for table cell
 */
export function SkeletonCell({ className, width = '100%' }: { className?: string; width?: string }) {
  const { skeleton } = useThemeColors()
  return (
    <Skeleton
      style={{
        ...skeleton.cell,
        width,
      }}
      className={className}
    />
  );
}

/**
 * Skeleton grid for dashboard cards - responsive layout
 */
export function SkeletonGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for appointment card
 */
export function SkeletonAppointmentCard({ className }: { className?: string }) {
  const { colors } = useThemeColors()
  return (
    <div
      className={cn('space-y-2', className)}
      style={{ padding: '0.85rem', border: `1px solid ${colors.primary}`, borderRadius: '10px' }}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1">
          <SkeletonText lines={2} />
        </div>
      </div>
      <SkeletonText lines={1} />
    </div>
  );
}

/**
 * Skeleton for invoice list item
 */
export function SkeletonInvoiceItem({ className }: { className?: string }) {
  const { colors } = useThemeColors()
  return (
    <div
      className={cn('flex items-center gap-4', className)}
      style={{ padding: '9px', borderBottom: `1px solid ${colors.subtle}` }}
    >
      <SkeletonCell width="100px" />
      <SkeletonCell width="120px" />
      <SkeletonCell width="80px" />
      <div className="flex-1" />
      <SkeletonButton />
    </div>
  );
}

/**
 * Skeleton for client table row
 */
export function SkeletonClientRow({ className }: { className?: string }) {
  const { colors } = useThemeColors()
  return (
    <div
      className={cn('flex items-center gap-4', className)}
      style={{ padding: '9px', borderBottom: `1px solid ${colors.subtle}` }}
    >
      <SkeletonAvatar />
      <SkeletonCell width="150px" />
      <SkeletonCell width="180px" />
      <SkeletonCell width="100px" />
      <div className="flex-1" />
      <div className="flex gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}

export { Skeleton };