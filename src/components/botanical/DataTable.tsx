'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { radii, typography, animations } from '@/styles/botanical';
import { useThemeColors } from '@/hooks/use-theme-colors';

// ============================================================================
// DATA TABLE COMPONENT - Consistent table styling matching invoice table design
// ============================================================================

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  const { colors } = useThemeColors()
  return (
    <div
      className={cn('overflow-hidden rounded-lg', className)}
      style={{
        background: colors.card,
        border: `1px solid ${colors.primary}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TABLE HEADER
// ============================================================================

interface DataTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className }: DataTableHeaderProps) {
  const { colors } = useThemeColors()
  return (
    <div
      className={cn(className)}
      style={{
        borderBottom: `1px solid ${colors.primary}`,
        background: colors.mutedBg,
        padding: '0.75rem 1rem',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TABLE HEADER LABEL
// ============================================================================

interface DataTableHeaderLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeaderLabel({ children, className }: DataTableHeaderLabelProps) {
  const { colors, typography } = useThemeColors()
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

// ============================================================================
// TABLE BODY
// ============================================================================

interface DataTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  const { colors } = useThemeColors()
  return (
    <div className={cn('divide-y', className)} style={{ ['divideColor' as any]: colors.subtle }}>
      {children}
    </div>
  );
}

// ============================================================================
// TABLE ROW
// ============================================================================

interface DataTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function DataTableRow({ children, className, onClick, hoverable = true }: DataTableRowProps) {
  const { colors } = useThemeColors()
  
  return (
    <div
      className={cn(className)}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        transition: hoverable ? 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (hoverable && onClick) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = colors.primaryBg;
          el.style.transform = 'scale(1.003)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'transparent';
          el.style.transform = 'scale(1)';
        }
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TABLE CELL
// ============================================================================

interface DataTableCellProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTableCell({ children, className, style }: DataTableCellProps) {
  return (
    <div className={cn(className)} style={style}>
      {children}
    </div>
  );
}

// ============================================================================
// HELPER: Grid columns for header
// ============================================================================

interface DataTableHeaderGridProps {
  columns: string;
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeaderGrid({ columns, children, className }: DataTableHeaderGridProps) {
  return (
    <div
      className={cn('hidden md:grid', className)}
      style={{
        gridTemplateColumns: columns,
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// HELPER: Grid columns for row
// ============================================================================

interface DataTableRowGridProps {
  columns: string;
  children: React.ReactNode;
  className?: string;
}

export function DataTableRowGrid({ columns, children, className }: DataTableRowGridProps) {
  return (
    <div
      className={cn('hidden md:grid', className)}
      style={{
        gridTemplateColumns: columns,
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// EXPORT ALL
// ============================================================================
// Components are already exported individually above
