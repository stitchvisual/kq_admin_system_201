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
            : 'border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)]',
          className
        )}
        {...props}
      />
    );
  }
);
FilterChip.displayName = 'FilterChip';

export { FilterChip };
