import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusPillClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'confirmed' || normalized === 'paid') {
    return 'status-pill status-pill--confirmed';
  }
  if (normalized === 'pending' || normalized === 'sent') {
    return 'status-pill status-pill--pending';
  }
  if (normalized === 'cancelled' || normalized === 'void' || normalized === 'draft') {
    return 'status-pill status-pill--cancelled';
  }
  return 'status-pill status-pill--draft';
}
