import { formatDateForInput } from '@/lib/date-utils';

/**
 * NDIS support item: Assistance with Self-Care Activities — Night-Time Sleepover (per Each).
 * Must match `support_item_code` in ndis_pricing (see scripts/seed-ndis-pricing.ts).
 */
export const OVERNIGHT_SLEEPOVER_NDIS_CODE = '01_010_0107_1_1';

/** True when start and end fall on different local calendar days (overnight / multi-night window). */
export function isOvernightAppointmentRange(startsAt: Date, endsAt: Date): boolean {
  return formatDateForInput(startsAt) !== formatDateForInput(endsAt);
}

type ResolveRateParams = {
  isGroup: boolean;
  startsAt: Date;
  endsAt: Date;
  /** From API/form body when provided; `undefined` means field omitted (update). */
  submittedRateCode?: string | null;
  existingRateCode?: string | null;
};

/**
 * Sets rate_code for invoicing: overnight → sleepover item; group daytime → submitted or prior non-sleepover code.
 */
export function resolveAppointmentRateCode(params: ResolveRateParams): {
  rate_code: string | null;
  validationError?: string;
} {
  const { isGroup, startsAt, endsAt, submittedRateCode, existingRateCode } = params;

  if (isOvernightAppointmentRange(startsAt, endsAt)) {
    return { rate_code: OVERNIGHT_SLEEPOVER_NDIS_CODE };
  }

  if (isGroup) {
    const trimmedSubmit =
      submittedRateCode !== undefined && submittedRateCode !== null && submittedRateCode !== ''
        ? submittedRateCode.trim()
        : undefined;
    if (trimmedSubmit) {
      return { rate_code: trimmedSubmit };
    }
    const existing = existingRateCode?.trim() ?? '';
    if (existing && existing !== OVERNIGHT_SLEEPOVER_NDIS_CODE) {
      return { rate_code: existing };
    }
    return {
      rate_code: null,
      validationError: 'Rate code is required for group appointments that are not overnight',
    };
  }

  return { rate_code: null };
}
