'use client';

import { useMemo } from 'react';
import { FilterChip } from '@/components/ui/filter-chip';
import {
  getQuarterHourTimeOptions,
  formatHHmmAU,
  isQuarterHourHHmm,
  COMMON_SESSION_START_TIMES_HHMM,
  COMMON_MORNING_END_TIMES_HHMM,
  formatTimeRange,
  formatDuration,
} from '@/lib/date-utils';
import { cn } from '@/lib/utils';

export type BookingTimeQuickPicks = 'session-starts' | 'morning-end' | false;

type BookingTimeSelectProps = {
  label: string;
  value: string;
  onChange: (hhmm: string) => void;
  quickPicks?: BookingTimeQuickPicks;
  selectClassName: string;
  required?: boolean;
};

export function BookingTimeSelect({
  label,
  value,
  onChange,
  quickPicks = false,
  selectClassName,
  required = true,
}: BookingTimeSelectProps) {
  const options = useMemo(() => getQuarterHourTimeOptions(), []);
  const onGrid = isQuarterHourHHmm(value);

  const picks = useMemo(() => {
    if (quickPicks === 'session-starts') return [...COMMON_SESSION_START_TIMES_HHMM];
    if (quickPicks === 'morning-end') return [...COMMON_MORNING_END_TIMES_HHMM];
    return [];
  }, [quickPicks]);

  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.06em] uppercase text-secondary">
        {label}
      </p>
      {picks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {picks.map(t => (
            <FilterChip
              key={t}
              type="button"
              size="sm"
              active={value === t}
              className="h-7 min-w-[3.25rem] px-2 text-[11px] font-semibold tabular-nums"
              onClick={() => onChange(t)}
            >
              {formatHHmmAU(t)}
            </FilterChip>
          ))}
        </div>
      )}
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={cn(selectClassName, 'cursor-pointer')}
      >
        {!value ? <option value="">Select time…</option> : null}
        {!onGrid && value ? (
          <option value={value}>{formatHHmmAU(value)} (exact)</option>
        ) : null}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type SessionTimePreviewProps = {
  dateStr: string;
  startHHmm: string;
  endHHmm: string;
  endDateStr: string;
  duration: string;
};

/** One-line human summary under the booking time fields. */
export function SessionTimePreview({
  dateStr,
  startHHmm,
  endHHmm,
  endDateStr,
  duration,
}: SessionTimePreviewProps) {
  if (!dateStr || !startHHmm) return null;

  let start: Date;
  let end: Date;
  try {
    start = new Date(`${dateStr}T${startHHmm}:00`);
    if (Number.isNaN(start.getTime())) return null;

    if (duration === 'custom' || duration === 'overnight') {
      if (!endHHmm) return null;
      const endDay =
        duration === 'overnight' && endDateStr ? endDateStr : dateStr;
      end = new Date(`${endDay}T${endHHmm}:00`);
    } else if (['30', '60', '90', '120'].includes(duration)) {
      end = new Date(start.getTime() + parseInt(duration, 10) * 60_000);
    } else {
      return null;
    }

    if (Number.isNaN(end.getTime()) || end <= start) return null;
  } catch {
    return null;
  }

  return (
    <p className="text-[11px] text-muted-foreground leading-snug rounded-lg border border-primary/25 bg-soft-cream/50 px-3 py-2">
      <span className="font-semibold text-foreground/85">When: </span>
      {formatTimeRange(start, end)}
      <span className="text-muted-foreground/80"> · </span>
      {formatDuration(start, end)}
    </p>
  );
}
