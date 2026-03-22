'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FilterChip } from '@/components/ui/filter-chip';
import {
  getOptionRange,
  matchesOption,
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

  const isOptionActive = (option: QuickOption) =>
    matchesOption(startDate, endDate, option);

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((option) => (
        <FilterChip
          key={option}
          active={isOptionActive(option)}
          size="sm"
          onClick={() => handleOptionClick(option)}
        >
          {QUICK_OPTION_LABELS[option]}
        </FilterChip>
      ))}
    </div>
  );
}

export default DateRangeQuickSelect;
