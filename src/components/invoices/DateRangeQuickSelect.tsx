'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  getOptionRange,
  QUICK_OPTION_LABELS,
  type QuickOption,
} from '@/lib/date-range-utils';

const DEFAULT_OPTIONS: QuickOption[] = ['thisWeek', 'lastWeek', 'thisMonth', 'last4Weeks'];

interface DateRangeQuickSelectProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  options?: QuickOption[];
  className?: string;
}

export function DateRangeQuickSelect({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  options = DEFAULT_OPTIONS,
  className,
}: DateRangeQuickSelectProps) {
  const handleOptionClick = (option: QuickOption) => {
    const range = getOptionRange(option);
    onStartDateChange(range.start);
    onEndDateChange(range.end);
  };

  const isOptionActive = (option: QuickOption): boolean => {
    const range = getOptionRange(option);
    return range.start === startDate && range.end === endDate;
  };

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((option) => {
        const active = isOptionActive(option);
        return (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={cn(
              'h-7 px-3 rounded-md text-xs font-medium transition-all',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)]'
            )}
          >
            {QUICK_OPTION_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}

export default DateRangeQuickSelect;
