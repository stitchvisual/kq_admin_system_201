'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span';
  noMargin?: boolean;
}

export function SectionLabel({ children, className, as: Component = 'p', noMargin }: SectionLabelProps) {
  return (
    <Component
      className={cn(
        'text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground',
        !noMargin && 'mb-1.5',
        className
      )}
    >
      {children}
    </Component>
  );
}
