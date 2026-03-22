'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/styles/botanical';
import { SectionLabel } from '@/components/shared/SectionLabel';

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

export function DataTableHeaderLabel(props: React.ComponentProps<typeof SectionLabel>) {
  return <SectionLabel as="span" noMargin {...props} />;
}
