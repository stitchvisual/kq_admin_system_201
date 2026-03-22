// src/lib/date-range-utils.ts

export type QuickOption = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last4Weeks';

export const QUICK_OPTIONS: QuickOption[] = ['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'last4Weeks'];

/** Title case labels - matches DateRangeQuickSelect. Use for GenerateDateRangeSelector via labelOverride if needed. */
export const QUICK_OPTION_LABELS: Record<QuickOption, string> = {
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last4Weeks: 'Last 4 Weeks',
};

/** Sentence case variant for GenerateDateRangeSelector. */
export const QUICK_OPTION_LABELS_SENTENCE: Record<QuickOption, string> = {
  thisWeek: 'This week',
  lastWeek: 'Last week',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  last4Weeks: 'Last 4 weeks',
};

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOptionRange(option: QuickOption): { start: string; end: string } {
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

/** Human-readable range for display (en-AU locale). */
export function formatDateRangeDisplay(start: string, end: string, fallback = 'Select date range'): string {
  if (!start) return fallback;
  const fmt = (s: string) => {
    const d = new Date(s + 'T12:00:00');
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – Select end`;
}

export function matchesOption(start: string, end: string, option: QuickOption): boolean {
  const r = getOptionRange(option);
  return r.start === start && r.end === end;
}
