'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { colors, typography } from '@/styles/botanical';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div
      className={cn('w-full min-w-0 overflow-hidden rounded-lg', className)}
      style={{
        background: colors.card,
        border: `1px solid ${colors.primary}`,
      }}
    >
      {children}
    </div>
  );
}

interface DataTableHeaderLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeaderLabel({ children, className }: DataTableHeaderLabelProps) {
  return (
    <span
      className={cn(className)}
      style={{
        fontSize: typography.sizes.label,
        fontWeight: typography.weights.bold,
        letterSpacing: typography.letterSpacing.label,
        textTransform: 'uppercase',
        color: colors.muted,
      } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
