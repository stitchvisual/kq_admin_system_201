// Calendar date utilities for weekly schedule view

export const ROW_HEIGHT_PX = 60;
export const GRID_START_HOUR = 7;  // 7am
export const GRID_END_HOUR = 18;   // 6pm

/**
 * Returns Monday 00:00:00 of the week containing the input date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // If Sunday (0), go back 6 days. Otherwise go back (day - 1) days to get Monday
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns array of 7 dates starting from weekStart (Mon-Sun)
 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Returns the start of the day (00:00:00.000) for the given date
 */
export function getDayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the end of the day (23:59:59.999) for the given date
 */
export function getDayEnd(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Returns "HH:mm" for time input fields (24-hour format)
 */
export function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Returns "YYYY-MM-DD" for date input fields
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns array of hours from start to end (inclusive)
 */
export function getHoursInRange(startHour: number, endHour: number): number[] {
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }
  return hours;
}

/**
 * Calculate position and dimensions for an appointment block
 * Grid has 8 columns: 1 time label column + 7 day columns
 */
export function calculateAppointmentPosition(
  startsAt: Date,
  endsAt: Date,
  dayIndex: number,
  gridStartHour: number
): { top: number; height: number; left: string; width: string } {
  const startHour = startsAt.getHours() + startsAt.getMinutes() / 60;
  const endHour = endsAt.getHours() + endsAt.getMinutes() / 60;
  
  const top = (startHour - gridStartHour) * ROW_HEIGHT_PX;
  const height = (endHour - startHour) * ROW_HEIGHT_PX;
  // Account for time label column: day 0 starts at 1/8, each day is 1/8 width
  const left = `calc(${(dayIndex + 1) / 8} * 100%)`;
  const width = `calc(${1 / 8} * 100% - 4px)`;
  
  return { top, height, left, width };
}

/**
 * Check if two time ranges overlap
 */
export function isOverlapping(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}

/**
 * Format hour for display (e.g., "7am", "12pm")
 */
export function formatHourLabel(hour: number): string {
  if (hour === 12) return '12pm';
  if (hour > 12) return `${hour - 12}pm`;
  return `${hour}am`;
}

/**
 * Format time range for display (e.g., "9:00am - 10:30am")
 * For overnight/multi-day: "Fri 6:00pm - Sat 8:00am"
 */
export function formatTimeRange(start: Date, end: Date): string {
  const startDay = formatDateForInput(start);
  const endDay = formatDateForInput(end);
  if (startDay !== endDay) {
    const startLabel = start.toLocaleDateString('en-AU', { weekday: 'short' });
    const endLabel = end.toLocaleDateString('en-AU', { weekday: 'short' });
    return `${startLabel} ${formatTime(start)} – ${endLabel} ${formatTime(end)}`;
  }
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes}${ampm}`;
}

/**
 * Calculate duration in minutes between two dates
 */
export function calculateDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Format duration for display (e.g., "1 hour", "1.5 hours", "30 minutes")
 */
export function formatDuration(start: Date, end: Date): string {
  const minutes = calculateDurationMinutes(start, end);
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = minutes / 60;
  if (hours === 1) return '1 hour';
  if (Number.isInteger(hours)) return `${hours} hours`;
  return `${hours} hours`;
}

/**
 * Get day index (0-6) from date, where Monday = 0
 */
export function getDayIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Format day name (e.g., "Mon", "Tue")
 */
export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-AU', { weekday: 'short' });
}

/**
 * Format day number (e.g., "15")
 */
export function formatDayNumber(date: Date): string {
  return date.getDate().toString();
}

/**
 * Format week range (e.g., "Jan 15 - Jan 21, 2024")
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const startMonth = weekStart.toLocaleDateString('en-AU', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-AU', { month: 'short' });
  const year = weekEnd.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${year}`;
  }
  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past (before today)
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}
