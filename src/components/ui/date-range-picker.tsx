'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  className?: string;
}

interface DatePreset {
  label: string;
  getRange: () => { start: Date; end: Date };
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
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [leftMonth, setLeftMonth] = useState(() => {
    const d = parseInputDate(startDate) || new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });
  const [rightMonth, setRightMonth] = useState(() => {
    const d = parseInputDate(endDate) || new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const start = parseInputDate(startDate);
  const end = parseInputDate(endDate);
  const min = minDate ? parseInputDate(minDate) : null;
  const max = maxDate ? parseInputDate(maxDate) : null;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Sync right month when selecting - use startDate string to avoid infinite loop
  useEffect(() => {
    if (start && selectingEnd) {
      const nextMonth = start.getMonth() === 11 ? 0 : start.getMonth() + 1;
      const nextYear = start.getMonth() === 11 ? start.getFullYear() + 1 : start.getFullYear();
      setLeftMonth({ month: start.getMonth(), year: start.getFullYear() });
      setRightMonth({ month: nextMonth, year: nextYear });
    }
  }, [selectingEnd, startDate]);

  const handlePreset = (preset: DatePreset) => {
    const { start: s, end: e } = preset.getRange();
    onStartDateChange(formatDateForInput(s));
    onEndDateChange(formatDateForInput(e));
    setSelectingEnd(false);
    setIsOpen(false);
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    const clicked = new Date(year, month, day);
    if (min && clicked < min) return;
    if (max && clicked > max) return;

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

  const navigateMonth = (direction: 'prev' | 'next', side: 'left' | 'right') => {
    const current = side === 'left' ? leftMonth : rightMonth;
    let newMonth = current.month;
    let newYear = current.year;
    
    if (direction === 'prev') {
      newMonth = newMonth === 0 ? 11 : newMonth - 1;
      newYear = newMonth === 11 ? newYear - 1 : newYear;
    } else {
      newMonth = newMonth === 11 ? 0 : newMonth + 1;
      newYear = newMonth === 0 ? newYear + 1 : newYear;
    }
    
    if (side === 'left') {
      setLeftMonth({ month: newMonth, year: newYear });
    } else {
      setRightMonth({ month: newMonth, year: newYear });
    }
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return 'Select date';
    const d = parseInputDate(dateStr);
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-10 px-3 rounded-lg border flex items-center justify-between gap-2',
          'text-sm transition-all duration-200',
          'hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        style={{
          borderColor: colors.primary,
          background: colors.card,
          color: start ? colors.heading : colors.muted,
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: colors.muted }} />
          <span>
            {start ? (
              end ? (
                `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`
              ) : (
                `${formatDisplayDate(startDate)} — Select end`
              )
            ) : (
              'Select date range'
            )}
          </span>
        </div>
        <ChevronRight
          size={16}
          style={{ color: colors.muted, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 rounded-xl shadow-lg border overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            background: colors.card,
            borderColor: colors.primary,
            boxShadow: shadows.hover,
            minWidth: '520px',
          }}
        >
          {/* Presets */}
          {presets && (
            <div
              className="flex gap-1.5 p-3 border-b"
              style={{ borderColor: colors.primary }}
            >
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all duration-150 hover:scale-[1.02]"
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

          {/* Two-month calendar */}
          <div className="flex">
            {/* Left Month */}
            <div className="flex-1 p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev', 'left')}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                  style={{ color: colors.muted }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.mutedBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.heading }}>
                  {MONTH_NAMES[leftMonth.month]} {leftMonth.year}
                </span>
                <div className="w-7" /> {/* Spacer for alignment */}
              </div>
              <div className="grid grid-cols-7 mb-1.5">
                {DOW_LABELS.map((l, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: colors.faint }}>
                    {l}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays(leftMonth.year, leftMonth.month).map((d, i) => (
                  <DayCell
                    key={i}
                    day={d}
                    year={leftMonth.year}
                    month={leftMonth.month}
                    start={start}
                    end={end}
                    min={min}
                    max={max}
                    selectingEnd={selectingEnd}
                    onClick={handleDayClick}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px" style={{ background: colors.primary }} />

            {/* Right Month */}
            <div className="flex-1 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7" /> {/* Spacer for alignment */}
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.heading }}>
                  {MONTH_NAMES[rightMonth.month]} {rightMonth.year}
                </span>
                <button
                  type="button"
                  onClick={() => navigateMonth('next', 'right')}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                  style={{ color: colors.muted }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.mutedBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1.5">
                {DOW_LABELS.map((l, i) => (
                  <div key={i} className="text-center text-[10px] font-semibold py-1" style={{ color: colors.faint }}>
                    {l}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays(rightMonth.year, rightMonth.month).map((d, i) => (
                  <DayCell
                    key={i}
                    day={d}
                    year={rightMonth.year}
                    month={rightMonth.month}
                    start={start}
                    end={end}
                    min={min}
                    max={max}
                    selectingEnd={selectingEnd}
                    onClick={handleDayClick}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer with clear button */}
          <div
            className="flex items-center justify-between px-3 py-2.5 border-t"
            style={{ borderColor: colors.primary, background: colors.mutedBg }}
          >
            <span className="text-[11px]" style={{ color: colors.muted }}>
              {selectingEnd ? 'Click to select end date' : 'Click to select start date'}
            </span>
            <button
              type="button"
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
                setSelectingEnd(false);
              }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors duration-150"
              style={{ color: colors.secondary }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.card)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
  if (day === null) return <div className="w-8 h-8" />;

  const current = new Date(year, month, day);
  const isStart = start && isSameDay(current, start);
  const isEnd = end && isSameDay(current, end);
  const isInRangeDay = isInRange(current, start, end);
  const isDisabled = (min && current < min) || (max && current > max);
  const today = new Date();
  const isToday = isSameDay(current, today);

  let bg = 'transparent';
  let textColor = colors.heading;
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
      disabled={isDisabled}
      onClick={() => onClick(year, month, day)}
      className="w-8 h-8 text-xs font-medium flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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