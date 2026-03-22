'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, active = false, size = 'sm', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'rounded-md font-medium transition-all',
          size === 'sm' && 'h-7 px-3 text-xs',
          size === 'md' && 'px-3 py-1.5 text-sm',
          active
            ? 'bg-primary text-white shadow-sm'
            : 'border border-[var(--color-chip-border)] bg-[var(--color-chip-bg)] text-[var(--color-chip-text)] hover:bg-[var(--color-chip-bg-hover)]',
          className
        )}
        {...props}
      />
    );
  }
);
FilterChip.displayName = 'FilterChip';

export { FilterChip };
