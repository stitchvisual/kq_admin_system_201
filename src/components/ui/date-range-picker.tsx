'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors, shadows, radii, typography } from '@/styles/botanical';

// ============================================================================
// TYPES
// ============================================================================

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  presets?: boolean;
  /** When true, renders only the calendar/presets (no trigger or dropdown wrapper) */
  inline?: boolean;
  /** When 'single', selects one date (use startDate as value, one click selects and closes) */
  mode?: 'range' | 'single';
  onClose?: () => void;
  className?: string;
}

interface DatePreset {
  label: string;
  getRange: () => { start: Date; end: Date };
}

interface SingleDatePreset {
  label: string;
  getDate: () => Date;
}

// ============================================================================
// PRESETS
// ============================================================================

const DATE_PRESETS: DatePreset[] = [
  {
    label: 'This Week',
    getRange: () => {
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday, end: sunday };
    },
  },
  {
    label: 'Last Week',
    getRange: () => {
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() + diff - 7);
      lastMonday.setHours(0, 0, 0, 0);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      return { start: lastMonday, end: lastSunday };
    },
  },
  {
    label: 'Last 2 Weeks',
    getRange: () => {
      const today = new Date();
      const end = new Date(today);
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(end.getDate() - 13);
      return { start, end };
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: firstDay, end: lastDay };
    },
  },
  {
    label: 'Last Month',
    getRange: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: firstDay, end: lastDay };
    },
  },
];

const SINGLE_DATE_PRESETS: SingleDatePreset[] = [
  { label: 'Today', getDate: () => new Date() },
  { label: 'In 7 days', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
  { label: 'In 14 days', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 14); return d; } },
  { label: 'In 30 days', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 30); return d; } },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const offset = startDow === 0 ? 6 : startDow - 1;
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = day.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  presets = true,
  inline = false,
  mode = 'range',
  onClose,
  className,
}: DateRangePickerProps) {
  const isSingle = mode === 'single';
  const [isOpen, setIsOpen] = useState(inline);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseInputDate(startDate) || parseInputDate(endDate) || new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const start = parseInputDate(startDate);
  const end = parseInputDate(endDate);
  const min = minDate ? parseInputDate(minDate) : null;
  const max = maxDate ? parseInputDate(maxDate) : null;

  // Close on outside click (dropdown mode only)
  useEffect(() => {
    if (inline) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [inline]);

  // When starting to select end date, jump to start's month
  const prevSelectingEnd = useRef(selectingEnd);
  useEffect(() => {
    if (selectingEnd && !prevSelectingEnd.current && start) {
      setCurrentMonth({ month: start.getMonth(), year: start.getFullYear() });
    }
    prevSelectingEnd.current = selectingEnd;
  }, [selectingEnd, start]);

  const handlePreset = (preset: DatePreset) => {
    const { start: s, end: e } = preset.getRange();
    onStartDateChange(formatDateForInput(s));
    onEndDateChange(formatDateForInput(e));
    setSelectingEnd(false);
    setIsOpen(false);
  };

  const handleSinglePreset = (preset: SingleDatePreset) => {
    const d = preset.getDate();
    const str = formatDateForInput(d);
    onStartDateChange(str);
    onEndDateChange(str);
    setIsOpen(false);
    if (inline && onClose) onClose();
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    const clicked = new Date(year, month, day);
    if (min && clicked < min) return;
    if (max && clicked > max) return;

    if (isSingle) {
      const str = formatDateForInput(clicked);
      onStartDateChange(str);
      onEndDateChange(str);
      setIsOpen(false);
      if (inline && onClose) onClose();
      return;
    }

    if (!selectingEnd) {
      onStartDateChange(formatDateForInput(clicked));
      onEndDateChange(''); // Clear end when starting new selection
      setSelectingEnd(true);
    } else {
      if (start && clicked < start) {
        onStartDateChange(formatDateForInput(clicked));
        onEndDateChange(formatDateForInput(start));
      } else {
        onEndDateChange(formatDateForInput(clicked));
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth.month;
    let newYear = currentMonth.year;
    if (direction === 'prev') {
      newMonth = newMonth === 0 ? 11 : newMonth - 1;
      newYear = newMonth === 11 ? newYear - 1 : newYear;
    } else {
      newMonth = newMonth === 11 ? 0 : newMonth + 1;
      newYear = newMonth === 0 ? newYear + 1 : newYear;
    }
    setCurrentMonth({ month: newMonth, year: newYear });
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'Select date';
    const d = parseInputDate(dateStr);
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePresetWithClose = (preset: DatePreset) => {
    handlePreset(preset);
    if (inline && onClose) onClose();
  };

  const handleDayClickWithClose = (year: number, month: number, day: number) => {
    const clicked = new Date(year, month, day);
    const wasSelectingEnd = selectingEnd;
    handleDayClick(year, month, day);
    if (inline && onClose && (isSingle || (wasSelectingEnd && start && clicked >= start))) onClose();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {!inline && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full h-10 px-3 rounded-lg border flex items-center justify-between gap-2',
            'text-sm transition-all duration-[var(--motion-duration-base)]',
            'border-[var(--color-chip-border)] bg-card',
            (isSingle ? startDate : start) ? 'text-foreground' : 'text-muted-foreground',
            'hover:bg-[var(--color-chip-bg-hover)] focus:ring-2 focus:ring-primary/20 focus:border-primary'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={16} className="text-muted-foreground shrink-0" />
            <span className="truncate">
              {isSingle
                ? (startDate ? formatDisplayDate(startDate) : 'Select date')
                : start
                  ? end
                    ? `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`
                    : `${formatDisplayDate(startDate)} — Select end`
                  : 'Select date range'}
            </span>
          </div>
          <ChevronRight
            size={16}
            className={cn('text-muted-foreground shrink-0 transition-transform duration-[var(--motion-duration-base)]', isOpen && 'rotate-90')}
          />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'overflow-hidden animate-in fade-in-0 duration-[var(--motion-duration-base)]',
            !inline && 'absolute left-0 md:left-auto md:right-0 z-50 mt-2 rounded-xl shadow-lg border'
          )}
          style={{
            background: colors.card,
            borderColor: colors.primary,
            boxShadow: shadows.hover,
            minWidth: 'min(280px, calc(100vw - 2rem))',
            maxWidth: '320px',
          }}
        >
          {presets && (
            <div
              className="flex flex-wrap gap-1.5 p-2.5 border-b"
              style={{ borderColor: colors.primary }}
            >
              {isSingle
                ? SINGLE_DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSinglePreset(preset)}
                      className="h-8 px-3 rounded-md text-xs font-medium transition-colors"
                      style={{
                        background: colors.mutedBg,
                        color: colors.secondary,
                        border: `1px solid ${colors.primary}`,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))
                : DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => (inline ? handlePresetWithClose(preset) : handlePreset(preset))}
                      className="h-8 px-3 rounded-md text-xs font-medium transition-colors"
                      style={{
                        background: colors.mutedBg,
                        color: colors.secondary,
                        border: `1px solid ${colors.primary}`,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
            </div>
          )}

          {/* Single month calendar */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-muted/50"
                style={{ color: colors.muted }}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold" style={{ color: colors.heading }}>
                {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
              </span>
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-muted/50"
                style={{ color: colors.muted }}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-x-1 gap-y-1">
              {DOW_LABELS.map((l, i) => (
                <div key={i} className="text-center text-xs font-medium py-1" style={{ color: colors.faint }}>
                  {l}
                </div>
              ))}
              {getMonthDays(currentMonth.year, currentMonth.month).map((d, i) => (
                <DayCell
                  key={i}
                  day={d}
                  year={currentMonth.year}
                  month={currentMonth.month}
                  start={start}
                  end={isSingle ? start : end}
                  min={min}
                  max={max}
                  selectingEnd={isSingle ? false : selectingEnd}
                  onClick={inline ? handleDayClickWithClose : handleDayClick}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-t"
            style={{ borderColor: colors.primary, background: colors.mutedBg }}
          >
            <span className="text-xs" style={{ color: colors.muted }}>
              {isSingle ? 'Select date' : selectingEnd ? 'Select end date' : 'Select start date'}
            </span>
            <button
              type="button"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
                setSelectingEnd(false);
                if (inline && onClose) onClose();
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{ color: colors.secondary }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DAY CELL COMPONENT
// ============================================================================

interface DayCellProps {
  day: number | null;
  year: number;
  month: number;
  start: Date | null;
  end: Date | null;
  min: Date | null;
  max: Date | null;
  selectingEnd: boolean;
  onClick: (year: number, month: number, day: number) => void;
}

function DayCell({ day, year, month, start, end, min, max, selectingEnd, onClick }: DayCellProps) {
  if (day === null) return <div className="w-8 h-8 sm:w-9 sm:h-9" />;

  const current = new Date(year, month, day);
  const isStart = start && isSameDay(current, start);
  const isEnd = end && isSameDay(current, end);
  const isInRangeDay = isInRange(current, start, end);
  const isDisabled = (min && current < min) || (max && current > max);
  const today = new Date();
  const isToday = isSameDay(current, today);

  let bg: string = 'transparent';
  let textColor: string = colors.heading;
  let borderRadius = '6px';

  if (isStart || isEnd) {
    bg = colors.primaryBase;
    textColor = '#fff';
    borderRadius = '6px';
  } else if (isInRangeDay) {
    bg = colors.primaryBg;
    textColor = colors.primaryBase;
    borderRadius = '0';
  } else if (isToday) {
    bg = colors.primaryLightBg;
    textColor = colors.primaryBase;
    borderRadius = '6px';
  }

  return (
    <button
      type="button"
      disabled={!!isDisabled}
      onClick={() => onClick(year, month, day)}
      className="w-8 h-8 sm:w-9 sm:h-9 text-sm font-medium flex items-center justify-center rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: bg,
        color: textColor,
        borderRadius,
        opacity: isDisabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled && !isStart && !isEnd) {
          e.currentTarget.style.background = colors.primaryLightBg;
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled && !isStart && !isEnd) {
          e.currentTarget.style.background = bg;
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {day}
    </button>
  );
}

export default DateRangePicker;