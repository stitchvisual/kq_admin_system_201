'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type QuickOption = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last4Weeks';

interface DateRangeQuickSelectProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  options?: QuickOption[];
  className?: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getOptionRange(option: QuickOption): { start: string; end: string } {
  const today = new Date();
  let start: Date;
  let end: Date;

  switch (option) {
    case 'thisWeek':
      start = getWeekStart(today);
      end = today;
      break;
    case 'lastWeek':
      start = getWeekStart(addDays(today, -7));
      end = addDays(getWeekStart(today), -1);
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'last4Weeks':
      start = addDays(getWeekStart(today), -21);
      end = today;
      break;
    default:
      start = today;
      end = today;
  }

  return {
    start: formatDateForInput(start),
    end: formatDateForInput(end),
  };
}

const optionLabels: Record<QuickOption, string> = {
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last4Weeks: 'Last 4 Weeks',
};

export function DateRangeQuickSelect({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  options = ['thisWeek', 'lastWeek', 'thisMonth', 'last4Weeks'],
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
                : 'border border-primary bg-transparent text-muted-foreground hover:bg-muted'
            )}
          >
            {optionLabels[option]}
          </button>
        );
      })}
    </div>
  );
}

export default DateRangeQuickSelect;
