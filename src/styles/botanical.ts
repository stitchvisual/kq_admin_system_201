// ============================================================================
// BOTANICAL DESIGN TOKENS
// ============================================================================
// Extracted from appointments page for consistent design across all pages

// ============================================================================
// LIGHT MODE COLOURS
// ============================================================================

export const colors = {
  // Backgrounds
  page: 'hsl(47 22% 96%)',          // warm off-white
  card: 'hsl(40 20% 98%)',        // slightly warmer white
  mutedBg: 'hsl(47 22% 94%)',       // light warm grey (backgrounds)

  // Borders
  primary: 'hsl(37 18% 89%)',        // warm light border
  subtle: 'hsl(37 18% 91%)',        // grid lines
  dashed: 'hsl(37 18% 92%)',        // quarter-hour marks

  // Text
  heading: 'hsl(145 15% 22%)',     // dark green-grey
  body: 'hsl(145 15% 28%)',        // medium green-grey
  secondary: 'hsl(145 15% 38%)',    // lighter body
  muted: 'hsl(145 15% 50%)',        // labels, metadata
  faint: 'hsl(145 15% 54%)',        // time labels

  // Primary Accent
  primaryBase: 'hsl(130 13% 50%)',        // sage green
  primaryHover: 'hsl(130 13% 44%)',       // darker sage
  primaryBg: 'hsl(130 13% 50% / 0.07)',   // subtle green tint
  primaryLightBg: 'hsl(130 13% 50% / 0.12)', // mini calendar highlight
} as const;

// ============================================================================
// DARK MODE COLOURS - Moonlit Garden Theme
// ============================================================================

export const darkColors = {
  // Backgrounds - warm charcoals instead of pure black
  page: 'hsl(30 10% 14%)',          // warm charcoal
  card: 'hsl(30 8% 18%)',           // dark warm grey (elevated surface)
  mutedBg: 'hsl(30 8% 22%)',        // medium charcoal

  // Borders - visible but subtle
  primary: 'hsl(30 8% 28%)',        // warm border
  subtle: 'hsl(30 8% 26%)',         // grid lines
  dashed: 'hsl(30 8% 30%)',         // quarter-hour marks

  // Text - warm whites and greys
  heading: 'hsl(40 20% 92%)',       // warm off-white
  body: 'hsl(40 15% 85%)',          // warm grey-white
  secondary: 'hsl(30 10% 65%)',     // medium grey
  muted: 'hsl(30 10% 55%)',         // labels, metadata
  faint: 'hsl(30 10% 48%)',         // time labels

  // Primary Accent - lighter for contrast on dark
  primaryBase: 'hsl(130 20% 55%)',        // lighter sage green
  primaryHover: 'hsl(130 20% 48%)',       // darker sage
  primaryBg: 'hsl(130 20% 55% / 0.12)',   // subtle green tint
  primaryLightBg: 'hsl(130 20% 55% / 0.18)', // mini calendar highlight
} as const;

// ============================================================================
// STATUS PALETTES
// ============================================================================;

export const appointmentStatus = {
  pending: {
    bg: 'rgba(182,148,112,0.22)',
    border: 'rgba(182,148,112,0.65)',
    dot: '#b69470',
    text: '#6b4d2f',
  },
  confirmed: {
    bg: 'rgba(120,149,170,0.22)',
    border: 'rgba(120,149,170,0.65)',
    dot: '#7895aa',
    text: '#2d4a5c',
  },
  completed: {
    bg: 'rgba(131,153,119,0.20)',
    border: 'rgba(131,153,119,0.60)',
    dot: '#7a9968',
    text: '#3a4d34',
  },
  cancelled: {
    bg: 'rgba(168,140,158,0.18)',
    border: 'rgba(168,140,158,0.50)',
    dot: '#a88c9e',
    text: '#5d3d55',
  },
} as const;

export const invoiceStatus = {
  draft: {
    bg: 'rgba(182,148,112,0.22)',
    border: 'rgba(182,148,112,0.65)',
    dot: '#b69470',
    text: '#6b4d2f',
  },
  issued: {
    bg: 'rgba(120,149,170,0.22)',
    border: 'rgba(120,149,170,0.65)',
    dot: '#7895aa',
    text: '#2d4a5c',
  },
  paid: {
    bg: 'rgba(131,153,119,0.20)',
    border: 'rgba(131,153,119,0.60)',
    dot: '#7a9968',
    text: '#3a4d34',
  },
  overdue: {
    bg: 'rgba(160,64,64,0.12)',
    border: 'rgba(160,64,64,0.35)',
    dot: '#a04040',
    text: '#7a3030',
  },
} as const;

// Client colour palettes - deterministic by client ID
export const CLIENT_PALETTES = [
  { bg: 'rgba(131,153,119,0.18)', border: 'rgba(131,153,119,0.55)', dot: '#839977', text: '#3a4d34' },
  { bg: 'rgba(182,148,112,0.18)', border: 'rgba(182,148,112,0.55)', dot: '#b69470', text: '#5a3e28' },
  { bg: 'rgba(120,149,170,0.18)', border: 'rgba(120,149,170,0.55)', dot: '#7895aa', text: '#2d4a5c' },
  { bg: 'rgba(168,140,158,0.18)', border: 'rgba(168,140,158,0.55)', dot: '#a88c9e', text: '#4d2e45' },
  { bg: 'rgba(172,163,118,0.18)', border: 'rgba(172,163,118,0.55)', dot: '#aca376', text: '#4a4020' },
  { bg: 'rgba(107,163,152,0.18)', border: 'rgba(107,163,152,0.55)', dot: '#6ba398', text: '#1e4a44' },
] as const;

export const GROUP_PALETTE = { 
  bg: 'rgba(107,163,152,0.18)', 
  border: 'rgba(107,163,152,0.55)', 
  dot: '#6ba398', 
  text: '#1e4a44' 
} as const;

export const getClientPalette = (clientId: string) => {
  const hash = clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLIENT_PALETTES[hash % CLIENT_PALETTES.length];
};

export const getAppointmentStatusStyle = (status: string) => {
  return appointmentStatus[status as keyof typeof appointmentStatus] || appointmentStatus.confirmed;
};

export const getInvoiceStatusStyle = (status: string) => {
  return invoiceStatus[status as keyof typeof invoiceStatus] || invoiceStatus.draft;
};

// ============================================================================
// DARK MODE STATUS PALETTES
// ============================================================================

export const darkAppointmentStatus = {
  pending: {
    bg: 'rgba(200,165,125,0.28)',
    border: 'rgba(200,165,125,0.75)',
    dot: '#c8a57d',
    text: '#e8d4c0',
  },
  confirmed: {
    bg: 'rgba(140,170,195,0.28)',
    border: 'rgba(140,170,195,0.75)',
    dot: '#8caac3',
    text: '#d0e0f0',
  },
  completed: {
    bg: 'rgba(150,175,135,0.25)',
    border: 'rgba(150,175,135,0.70)',
    dot: '#96af87',
    text: '#d8e8d0',
  },
  cancelled: {
    bg: 'rgba(185,155,170,0.25)',
    border: 'rgba(185,155,170,0.70)',
    dot: '#b99baa',
    text: '#e8d8e0',
  },
  noShow: {
    bg: 'rgba(160,64,64,0.22)',
    border: 'rgba(160,64,64,0.55)',
    dot: '#a04040',
    text: '#e8b8b8',
  },
} as const;

export const darkInvoiceStatus = {
  draft: {
    bg: 'rgba(200,165,125,0.28)',
    border: 'rgba(200,165,125,0.75)',
    dot: '#c8a57d',
    text: '#e8d4c0',
  },
  issued: {
    bg: 'rgba(140,170,195,0.28)',
    border: 'rgba(140,170,195,0.75)',
    dot: '#8caac3',
    text: '#d0e0f0',
  },
  paid: {
    bg: 'rgba(150,175,135,0.25)',
    border: 'rgba(150,175,135,0.70)',
    dot: '#96af87',
    text: '#d8e8d0',
  },
  overdue: {
    bg: 'rgba(200,90,90,0.22)',
    border: 'rgba(200,90,90,0.55)',
    dot: '#c85a5a',
    text: '#e8b8b8',
  },
  cancelled: {
    bg: 'rgba(185,155,170,0.25)',
    border: 'rgba(185,155,170,0.70)',
    dot: '#b99baa',
    text: '#e8d8e0',
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================;

export const shadows = {
  subtle: '0 1px 4px rgba(45,58,49,0.07)',
  elevated: '0 1px 6px rgba(45,58,49,0.05)',
  hover: '0 4px 14px rgba(45,58,49,0.13)',
  active: '0 4px 12px rgba(45,58,49,0.12)',
  button: '0 1px 6px rgba(45,58,49,0.18)',
} as const;

// Dark mode shadows - darker and warmer
export const darkShadows = {
  subtle: '0 1px 4px rgba(0,0,0,0.35)',
  elevated: '0 1px 6px rgba(0,0,0,0.40)',
  hover: '0 4px 14px rgba(0,0,0,0.50)',
  active: '0 4px 12px rgba(0,0,0,0.45)',
  button: '0 1px 6px rgba(0,0,0,0.45)',
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
    body: '0.82rem',
    small: '0.78rem',
    label: '0.65rem',
    tiny: '0.62rem',
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

export const animations = {
  // Durations (in ms)
  instant: 0,
  fast: 120,
  normal: 200,
  slow: 300,
  slower: 500,
  
  // Easing functions - cubic-bezier for smooth natural motion
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // "Smooth" easing - feels more natural for UI transitions
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // "Bounce" easing - for playful micro-interactions
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // Preset transition styles (include all properties for consistency)
  subtle: 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)',
  default: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  smoothTransition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  slowTransition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Transform-only transitions (GPU accelerated)
  transformSubtle: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
  transformDefault: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  transformSmooth: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Opacity transitions
  opacityFast: 'opacity 120ms ease',
  opacityDefault: 'opacity 200ms ease',
  
  // Shadow transitions
  shadowDefault: 'box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  
  // Focus ring transition
  focusRing: 'box-shadow 150ms ease, outline 150ms ease',
  
  // Micro-interaction constants
  pressScale: 0.98,
  hoverLift: '-1px',
  hoverScale: 1.01,
  
  // Button shadow transition
  buttonShadow: 'box-shadow 120ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// ============================================================================
// SKELETON
// ============================================================================

export const skeleton = {
  base: {
    background: 'hsl(37 18% 92%)',
    borderRadius: radii.button,
  },
  
  // Shimmer animation colors
  shimmerStart: 'hsl(37 18% 92%)',
  shimmerMiddle: 'hsl(37 18% 95%)',
  shimmerEnd: 'hsl(37 18% 92%)',
  shimmerDuration: '1.5s',
  
  // Sizes
  text: { height: '1rem', width: '80%', borderRadius: '4px' },
  textShort: { height: '1rem', width: '60%', borderRadius: '4px' },
  button: { height: 36, width: 100, borderRadius: radii.button },
  card: { height: 120, borderRadius: radii.card },
  avatar: { width: 38, height: 38, borderRadius: '50%' },
  row: { height: 52, borderRadius: radii.button },
  cell: { width: '100%', height: 20, borderRadius: '4px' },
} as const;

// Dark mode skeleton colors
export const darkSkeleton = {
  base: {
    background: 'hsl(30 8% 22%)',
    borderRadius: radii.button,
  },
  shimmerStart: 'hsl(30 8% 22%)',
  shimmerMiddle: 'hsl(30 8% 28%)',
  shimmerEnd: 'hsl(30 8% 22%)',
  shimmerDuration: '1.2s',
  // Sizes (same dimensions as light, colors come from shimmer)
  text: { height: '1rem', width: '80%', borderRadius: '4px' },
  textShort: { height: '1rem', width: '60%', borderRadius: '4px' },
  button: { height: 36, width: 100, borderRadius: radii.button },
  card: { height: 120, borderRadius: radii.card },
  avatar: { width: 38, height: 38, borderRadius: '50%' },
  row: { height: 52, borderRadius: radii.button },
  cell: { width: '100%', height: 20, borderRadius: '4px' },
} as const;

// ============================================================================
// REUSABLE STYLES
// ============================================================================;

export const buttonStyles = {
  primaryBtn: (bg: string, hoverBg?: string): React.CSSProperties => ({
    height: sizes.buttonHeight,
    borderRadius: radii.button,
    border: 'none',
    background: bg,
    color: '#fff',
    fontSize: '0.8rem',
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
    fontSize: '0.8rem',
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
// DARK MODE HELPERS
// ============================================================================

// Helper to get appointment status colors based on theme
export const getAppointmentStatusColors = (isDark: boolean) => {
  return isDark ? darkAppointmentStatus : appointmentStatus;
};

// Helper to get invoice status colors based on theme
export const getInvoiceStatusColors = (isDark: boolean) => {
  return isDark ? darkInvoiceStatus : invoiceStatus;
};

// Helper to get shadows based on theme
export const getShadows = (isDark: boolean) => {
  return isDark ? darkShadows : shadows;
};

// Helper to get skeleton colors based on theme
export const getSkeleton = (isDark: boolean) => {
  return isDark ? darkSkeleton : skeleton;
};