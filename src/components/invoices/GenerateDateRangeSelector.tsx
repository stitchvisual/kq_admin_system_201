'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterChip } from '@/components/ui/filter-chip';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  getOptionRange,
  formatDateRangeDisplay,
  matchesOption,
  QUICK_OPTIONS,
  QUICK_OPTION_LABELS_SENTENCE,
  type QuickOption,
} from '@/lib/date-range-utils';

interface GenerateDateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export function GenerateDateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: GenerateDateRangeSelectorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = QUICK_OPTIONS.find((o) => matchesOption(startDate, endDate, o)) ?? null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreset = (option: QuickOption) => {
    const { start, end } = getOptionRange(option);
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div ref={containerRef} className={cn('space-y-3', className)}>
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => (
          <FilterChip
            key={option}
            active={activeOption === option}
            size="md"
            onClick={() => handlePreset(option)}
          >
            {QUICK_OPTION_LABELS_SENTENCE[option]}
          </FilterChip>
        ))}
      </div>

      {/* Custom range row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className={cn(
            'flex-1 min-w-0 h-10 px-3 rounded-lg border flex items-center justify-between gap-2 text-left',
            'border-[hsl(34_22%_74%)] bg-card',
            startDate ? 'text-foreground' : 'text-muted-foreground',
            'hover:bg-[hsl(42_26%_98%)] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Calendar size={16} className="text-muted-foreground shrink-0" />
            <span className="truncate text-sm">{formatDateRangeDisplay(startDate, endDate)}</span>
          </span>
          <ChevronDown
            size={16}
            className={cn('text-muted-foreground shrink-0 transition-transform', pickerOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Calendar popover - compact width, doesn't stretch full container */}
      {pickerOpen && (
        <div className="w-max max-w-full rounded-xl border border-[hsl(34_22%_74%)] bg-card shadow-lg overflow-hidden">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(d) => {
              onStartDateChange(d);
              if (!endDate) onEndDateChange('');
            }}
            onEndDateChange={onEndDateChange}
            presets={true}
            inline={true}
            onClose={() => setPickerOpen(false)}
            className="border-0 shadow-none"
          />
        </div>
      )}
    </div>
  );
}

export default GenerateDateRangeSelector;
