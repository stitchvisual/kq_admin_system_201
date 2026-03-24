'use client';

import { formatHHmmAU, formatTimeRange, formatDuration } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

type BookingTimeSelectProps = {
  label: string;
  value: string;
  onChange: (hhmm: string) => void;
  /** Matches other form fields (border, radius, etc.) */
  className: string;
  required?: boolean;
};

/**
 * Native time input — uses the OS/browser time picker (fast on mobile, keyboard-friendly on desktop).
 * step=60 allows any minute; shows a plain-language line under the field when a time is set.
 */
export function BookingTimeSelect({
  label,
  value,
  onChange,
  className,
  required = true,
}: BookingTimeSelectProps) {
  return (
    <div>
      <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.06em] uppercase text-secondary">
        {label}
      </p>
      <input
        type="time"
        step={60}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        aria-label={label}
        className={cn(className, 'min-h-10 tabular-nums')}
      />
      {value ? (
        <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">{formatHHmmAU(value)}</p>
      ) : null}
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
