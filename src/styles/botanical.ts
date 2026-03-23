// ============================================================================
// BOTANICAL DESIGN TOKENS
// ============================================================================
// Design tokens for the KQ System botanical design system.
//
// Architecture:
// - CSS variables in globals.css are the source of truth for Tailwind/CSS
// - This file provides JS/TS access for inline styles, dynamic palettes, and
//   theme-aware logic (e.g., FullCalendar, status badges, client colors)
// - Where possible, we reference CSS variables; otherwise we define raw values

// ============================================================================
// TYPES
// ============================================================================

export type StatusKey = 'pending' | 'confirmed' | 'completed' | 'invoiced' | 'cancelled' | 'noShow';
export type InvoiceStatusKey = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface StatusPalette {
  bg: string;
  border: string;
  dot: string;
  text: string;
}

// ============================================================================
// CORE COLOR PALETTES
// ============================================================================

/** Light mode colors */
export const colors = {
  // Backgrounds
  page: 'hsl(47 22% 96%)',
  card: 'hsl(40 20% 98%)',
  mutedBg: 'hsl(47 22% 94%)',

  // Borders
  primary: 'hsl(37 18% 89%)',
  subtle: 'hsl(37 18% 91%)',
  dashed: 'hsl(37 18% 92%)',

  // Text
  heading: 'hsl(145 15% 22%)',
  body: 'hsl(145 15% 28%)',
  secondary: 'hsl(145 15% 38%)',
  muted: 'hsl(145 15% 50%)',
  faint: 'hsl(145 15% 54%)',

  // Primary Accent (Sage Green)
  primaryBase: 'hsl(130 13% 50%)',
  primaryHover: 'hsl(130 13% 44%)',
  primaryBg: 'hsl(130 13% 50% / 0.07)',
  primaryLightBg: 'hsl(130 13% 50% / 0.12)',
} as const;

/** Dark mode colors - Moonlit Garden theme */
export const darkColors = {
  // Backgrounds
  page: 'hsl(30 10% 14%)',
  card: 'hsl(30 8% 18%)',
  mutedBg: 'hsl(30 8% 22%)',

  // Borders
  primary: 'hsl(30 8% 28%)',
  subtle: 'hsl(30 8% 26%)',
  dashed: 'hsl(30 8% 30%)',

  // Text
  heading: 'hsl(40 20% 92%)',
  body: 'hsl(40 15% 85%)',
  secondary: 'hsl(30 10% 65%)',
  muted: 'hsl(30 10% 55%)',
  faint: 'hsl(30 10% 48%)',

  // Primary Accent
  primaryBase: 'hsl(130 20% 55%)',
  primaryHover: 'hsl(130 20% 48%)',
  primaryBg: 'hsl(130 20% 55% / 0.12)',
  primaryLightBg: 'hsl(130 20% 55% / 0.18)',
} as const;

// ============================================================================
// STATUS PALETTES
// ============================================================================

/** Shared status color values - single source of truth */
const createStatusPalettes = (isDark: boolean) => {
  const alpha = {
    bg: isDark ? 0.25 : 0.18,
    border: isDark ? 0.70 : 0.55,
  };

  return {
    pending: {
      bg: `rgba(182, 148, 112, ${isDark ? 0.28 : 0.22})`,
      border: `rgba(182, 148, 112, ${isDark ? 0.75 : 0.65})`,
      dot: isDark ? '#c8a57d' : '#b69470',
      text: isDark ? '#e8d4c0' : '#6b4d2f',
    },
    confirmed: {
      bg: `rgba(120, 149, 170, ${isDark ? 0.28 : 0.22})`,
      border: `rgba(120, 149, 170, ${isDark ? 0.75 : 0.65})`,
      dot: isDark ? '#8caac3' : '#7895aa',
      text: isDark ? '#d0e0f0' : '#2d4a5c',
    },
    completed: {
      bg: `rgba(131, 153, 119, ${isDark ? 0.25 : 0.20})`,
      border: `rgba(131, 153, 119, ${isDark ? 0.70 : 0.60})`,
      dot: isDark ? '#96af87' : '#7a9968',
      text: isDark ? '#d8e8d0' : '#3a4d34',
    },
    invoiced: {
      bg: `rgba(139, 115, 175, ${isDark ? 0.28 : 0.22})`,
      border: `rgba(139, 115, 175, ${isDark ? 0.75 : 0.65})`,
      dot: isDark ? '#9f87c3' : '#8b73af',
      text: isDark ? '#e0d4f0' : '#4a3d6b',
    },
    cancelled: {
      bg: `rgba(168, 140, 158, ${isDark ? 0.25 : 0.18})`,
      border: `rgba(168, 140, 158, ${isDark ? 0.70 : 0.50})`,
      dot: isDark ? '#b99baa' : '#a88c9e',
      text: isDark ? '#e8d8e0' : '#5d3d55',
    },
    noShow: {
      bg: `rgba(160, 64, 64, ${isDark ? 0.22 : 0.15})`,
      border: `rgba(160, 64, 64, ${isDark ? 0.55 : 0.40})`,
      dot: '#a04040',
      text: isDark ? '#e8b8b8' : '#6a3030',
    },
  } as const;
};

/** Light mode appointment/invoice status palettes */
export const appointmentStatus = createStatusPalettes(false);
export const invoiceStatus: Record<InvoiceStatusKey, StatusPalette> = {
  draft: appointmentStatus.pending,
  issued: appointmentStatus.confirmed,
  paid: appointmentStatus.completed,
  overdue: {
    bg: 'rgba(160, 64, 64, 0.12)',
    border: 'rgba(160, 64, 64, 0.35)',
    dot: '#a04040',
    text: '#7a3030',
  },
  cancelled: appointmentStatus.cancelled,
};

/** Dark mode appointment/invoice status palettes */
export const darkAppointmentStatus = createStatusPalettes(true);
export const darkInvoiceStatus: Record<InvoiceStatusKey, StatusPalette> = {
  draft: darkAppointmentStatus.pending,
  issued: darkAppointmentStatus.confirmed,
  paid: darkAppointmentStatus.completed,
  overdue: {
    bg: 'rgba(200, 90, 90, 0.22)',
    border: 'rgba(200, 90, 90, 0.55)',
    dot: '#c85a5a',
    text: '#e8b8b8',
  },
  cancelled: darkAppointmentStatus.cancelled,
};

// ============================================================================
// CLIENT PALETTES (Deterministic by client ID)
// ============================================================================

export const CLIENT_PALETTES: readonly StatusPalette[] = [
  { bg: 'rgba(131, 153, 119, 0.18)', border: 'rgba(131, 153, 119, 0.55)', dot: '#839977', text: '#3a4d34' },
  { bg: 'rgba(182, 148, 112, 0.18)', border: 'rgba(182, 148, 112, 0.55)', dot: '#b69470', text: '#5a3e28' },
  { bg: 'rgba(120, 149, 170, 0.18)', border: 'rgba(120, 149, 170, 0.55)', dot: '#7895aa', text: '#2d4a5c' },
  { bg: 'rgba(168, 140, 158, 0.18)', border: 'rgba(168, 140, 158, 0.55)', dot: '#a88c9e', text: '#4d2e45' },
  { bg: 'rgba(172, 163, 118, 0.18)', border: 'rgba(172, 163, 118, 0.55)', dot: '#aca376', text: '#4a4020' },
  { bg: 'rgba(107, 163, 152, 0.18)', border: 'rgba(107, 163, 152, 0.55)', dot: '#6ba398', text: '#1e4a44' },
];

export const GROUP_PALETTE: StatusPalette = {
  bg: 'rgba(107, 163, 152, 0.18)',
  border: 'rgba(107, 163, 152, 0.55)',
  dot: '#6ba398',
  text: '#1e4a44',
};

export const getClientPalette = (clientId: string): StatusPalette => {
  const hash = clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLIENT_PALETTES[hash % CLIENT_PALETTES.length];
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

export const getAppointmentStatusStyle = (
  status: string,
  invoiced?: boolean
): StatusPalette => {
  if (invoiced && status === 'completed') {
    return appointmentStatus.invoiced;
  }
  return appointmentStatus[status as keyof typeof appointmentStatus] ?? appointmentStatus.confirmed;
};

export const getInvoiceStatusStyle = (status: string): StatusPalette => {
  return invoiceStatus[status as InvoiceStatusKey] ?? invoiceStatus.draft;
};

// ============================================================================
// SHADOWS
// ============================================================================

/** Light mode shadows - warm amber-brown depth */
export const shadows = {
  subtle: '0 1px 4px rgba(45, 58, 49, 0.07)',
  elevated: '0 1px 6px rgba(45, 58, 49, 0.05)',
  hover: '0 4px 14px rgba(45, 58, 49, 0.13)',
  active: '0 4px 12px rgba(45, 58, 49, 0.12)',
  button: '0 1px 6px rgba(45, 58, 49, 0.18)',
} as const;

/** Dark mode shadows - deeper, neutral */
export const darkShadows = {
  subtle: '0 1px 4px rgba(0, 0, 0, 0.35)',
  elevated: '0 1px 6px rgba(0, 0, 0, 0.40)',
  hover: '0 4px 14px rgba(0, 0, 0, 0.50)',
  active: '0 4px 12px rgba(0, 0, 0, 0.45)',
  button: '0 1px 6px rgba(0, 0, 0, 0.45)',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',

  sizes: {
    pageTitle: '1.15rem',
    cardTitle: '1rem',
    body: 'var(--font-size-body)',
    small: 'var(--font-size-meta)',
    label: '0.65rem',
    tiny: '0.62rem',
    badge: 'var(--font-size-badge)',
    meta: 'var(--font-size-meta)',
  },

  weights: {
    heading: 600,
    body: 500,
    bold: 700,
  },

  letterSpacing: {
    label: '0.06em',
  },
} as const;

// ============================================================================
// SPACING & RADII
// ============================================================================

export const spacing = {
  card: '0.85rem',
  inputPadding: '0 10px',
  buttonPadding: '0 14px',
  cell: '5px 9px',
} as const;

export const radii = {
  card: '10px',
  button: '8px',
  badge: '99px',
  input: '8px',
  avatar: '50%',
} as const;

export const sizes = {
  inputHeight: 36,
  buttonHeight: 36,
  navBtn: 30,
  sidebar: 220,
  panel: 360,
  avatarSmall: 24,
  avatarMedium: 38,
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

/** Easing presets */
export const easing = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

/** Duration presets (ms) */
export const duration = {
  instant: 0,
  fast: 120,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

export const animations = {
  // Durations
  ...duration,

  // Easing
  ...easing,

  // Transition presets
  subtle: `all 120ms ${easing.smooth}`,
  default: `all 200ms ${easing.smooth}`,
  smoothTransition: `all 300ms ${easing.smooth}`,
  slowTransition: `all 500ms ${easing.smooth}`,

  // Transform-only (GPU accelerated)
  transformSubtle: `transform 120ms ${easing.smooth}`,
  transformDefault: `transform 200ms ${easing.smooth}`,
  transformSmooth: `transform 300ms ${easing.smooth}`,

  // Opacity
  opacityFast: 'opacity 120ms ease',
  opacityDefault: 'opacity 200ms ease',

  // Shadow
  shadowDefault: `box-shadow 200ms ${easing.smooth}`,
  buttonShadow: `box-shadow 120ms ${easing.smooth}`,

  // Focus
  focusRing: 'box-shadow 150ms ease, outline 150ms ease',

  // Micro-interactions
  pressScale: 0.98,
  hoverLift: '-1px',
  hoverScale: 1.01,
} as const;

// ============================================================================
// SKELETON
// ============================================================================

/** Shared skeleton dimensions - used by both light and dark */
const skeletonSizes = {
  text: { height: '1rem', width: '80%', borderRadius: '4px' },
  textShort: { height: '1rem', width: '60%', borderRadius: '4px' },
  button: { height: 36, width: 100, borderRadius: radii.button },
  card: { height: 120, borderRadius: radii.card },
  avatar: { width: 38, height: 38, borderRadius: '50%' },
  row: { height: 52, borderRadius: radii.button },
  cell: { width: '100%', height: 20, borderRadius: '4px' },
} as const;

/** Light mode skeleton */
export const skeleton = {
  base: {
    background: 'hsl(37 18% 92%)',
    borderRadius: radii.button,
  },
  shimmerStart: 'hsl(37 18% 92%)',
  shimmerMiddle: 'hsl(37 18% 95%)',
  shimmerEnd: 'hsl(37 18% 92%)',
  shimmerDuration: '1.5s',
  ...skeletonSizes,
} as const;

/** Dark mode skeleton */
export const darkSkeleton = {
  base: {
    background: 'hsl(30 8% 22%)',
    borderRadius: radii.button,
  },
  shimmerStart: 'hsl(30 8% 22%)',
  shimmerMiddle: 'hsl(30 8% 28%)',
  shimmerEnd: 'hsl(30 8% 22%)',
  shimmerDuration: '1.2s',
  ...skeletonSizes,
} as const;

// ============================================================================
// REUSABLE STYLE PRESETS
// ============================================================================

export const buttonStyles = {
  primaryBtn: (bg: string, hoverBg?: string): React.CSSProperties => ({
    height: sizes.buttonHeight,
    borderRadius: radii.button,
    border: 'none',
    background: bg,
    color: '#fff',
    fontSize: 'var(--font-size-meta)',
    fontWeight: typography.weights.heading,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: typography.body,
    boxShadow: shadows.button,
  }),

  secondaryBtn: {
    height: sizes.buttonHeight,
    padding: spacing.buttonPadding,
    borderRadius: radii.button,
    border: `1px solid ${colors.primary}`,
    background: 'transparent',
    color: colors.secondary,
    fontSize: 'var(--font-size-meta)',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    fontFamily: typography.body,
  } as const,

  navBtn: {
    width: sizes.navBtn,
    height: sizes.navBtn,
    borderRadius: radii.button,
    border: `1px solid ${colors.primary}`,
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.secondary,
  } as const,
} as const;

export const formStyles = {
  input: {
    width: '100%',
    height: sizes.inputHeight,
    padding: spacing.inputPadding,
    borderRadius: radii.input,
    border: `1px solid ${colors.primary}`,
    background: colors.card,
    fontSize: typography.sizes.body,
    color: colors.heading,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: typography.body,
  } as const,

  select: {
    width: '100%',
    height: sizes.inputHeight,
    padding: spacing.inputPadding,
    paddingRight: 8,
    borderRadius: radii.input,
    border: `1px solid ${colors.primary}`,
    background: colors.card,
    fontSize: typography.sizes.body,
    color: colors.heading,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: typography.body,
    cursor: 'pointer',
  } as const,

  label: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.label,
    textTransform: 'uppercase',
    color: colors.muted,
  } as const,
} as const;

export const cardStyles = {
  card: {
    background: colors.card,
    border: `1px solid ${colors.primary}`,
    borderRadius: radii.card,
    padding: spacing.card,
  } as const,

  badge: (bg: string, textColor: string): React.CSSProperties => ({
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '1px 8px',
    borderRadius: radii.badge,
    background: bg,
    color: textColor,
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  }),
} as const;

// ============================================================================
// THEME HELPERS
// ============================================================================

/** Get appointment status colors based on theme */
export const getAppointmentStatusColors = (isDark: boolean) =>
  isDark ? darkAppointmentStatus : appointmentStatus;

/** Get invoice status colors based on theme */
export const getInvoiceStatusColors = (isDark: boolean) =>
  isDark ? darkInvoiceStatus : invoiceStatus;

/** Get shadows based on theme */
export const getShadows = (isDark: boolean) =>
  isDark ? darkShadows : shadows;

/** Get skeleton colors based on theme */
export const getSkeleton = (isDark: boolean) =>
  isDark ? darkSkeleton : skeleton;