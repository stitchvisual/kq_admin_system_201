# Design Tokens

This document describes the design token strategy for the KQ System botanical design system.

## Architecture Overview

Design tokens live in two coordinated locations:

### 1. `src/styles/botanical.ts` (TypeScript)

**Purpose:** JS/TS consumers for inline styles, themes, and programmatic use.

**Contents:**
- **Core colors:** `colors`, `darkColors` (backgrounds, borders, text, primary accent)
- **Status palettes:** `appointmentStatus`, `invoiceStatus` (with dark variants)
- **Client palettes:** `CLIENT_PALETTES`, `GROUP_PALETTE`, `getClientPalette()`
- **Shadows:** `shadows`, `darkShadows`
- **Typography:** `typography` (fonts, sizes, weights)
- **Spacing & radii:** `spacing`, `radii`, `sizes`
- **Animations:** `easing`, `duration`, `animations`
- **Skeleton:** `skeleton`, `darkSkeleton`
- **Style presets:** `buttonStyles`, `formStyles`, `cardStyles`

**Exports:**
```typescript
// Types
export type StatusKey = 'pending' | 'confirmed' | 'completed' | 'invoiced' | 'cancelled' | 'noShow';
export type InvoiceStatusKey = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
export interface StatusPalette { bg: string; border: string; dot: string; text: string; }

// Core tokens
export const colors, darkColors, shadows, darkShadows, typography, spacing, radii, sizes;

// Status palettes
export const appointmentStatus, darkAppointmentStatus, invoiceStatus, darkInvoiceStatus;

// Client colors
export const CLIENT_PALETTES, GROUP_PALETTE, getClientPalette;

// Animation tokens
export const easing, duration, animations;

// Skeleton loading
export const skeleton, darkSkeleton;

// Style presets
export const buttonStyles, formStyles, cardStyles;

// Theme helpers
export const getAppointmentStatusColors, getInvoiceStatusColors, getShadows, getSkeleton;
export const getAppointmentStatusStyle, getInvoiceStatusStyle;
```

### 2. `src/app/globals.css` (CSS)

**Purpose:** Tailwind theme, CSS utilities, and components that use CSS variables.

**Contents:**
- `@theme` block with Tailwind 4 variables
- Semantic status tokens (`--status-confirmed-*`, `--status-pending-*`, etc.)
- Shadow tokens (`--shadow-soft`, `--shadow-card`, etc.)
- Typography tokens (`--font-heading`, `--font-body`, `--font-size-*`)
- Panel and animation tokens
- CSS utility classes

## Key Improvements

### Status Palette Generation

Status colors are now generated from a single factory function, ensuring consistency:

```typescript
const createStatusPalettes = (isDark: boolean) => ({
  pending: { bg: `rgba(182, 148, 112, ${isDark ? 0.28 : 0.22})`, ... },
  confirmed: { bg: `rgba(120, 149, 170, ${isDark ? 0.28 : 0.22})`, ... },
  // ... other statuses
});
```

### Invoice Status Reuse

Invoice statuses reuse appointment palette colors where semantically appropriate:

```typescript
export const invoiceStatus = {
  draft: appointmentStatus.pending,      // Same visual treatment
  issued: appointmentStatus.confirmed,
  paid: appointmentStatus.completed,
  overdue: { /* custom red */ },
  cancelled: appointmentStatus.cancelled,
};
```

### Skeleton Size Sharing

Skeleton dimensions are shared between light and dark modes:

```typescript
const skeletonSizes = { text: {...}, button: {...}, ... };
export const skeleton = { ...skeletonSizes, shimmerStart: '...' };
export const darkSkeleton = { ...skeletonSizes, shimmerStart: '...' };
```

### Animation Token Structure

Animations are now organized with separate easing and duration exports:

```typescript
export const easing = { smooth: 'cubic-bezier(0.16, 1, 0.3, 1)', ... };
export const duration = { fast: 120, normal: 200, ... };
export const animations = { ...easing, ...duration, subtle: `all 120ms ${easing.smooth}`, ... };
```

## Usage Guidelines

### When to use botanical.ts
- Inline styles requiring dynamic values
- Theme-aware color selection (e.g., `useThemeColors()` hook)
- FullCalendar event styling
- Client-specific color palettes
- Status badge colors in JS components

### When to use CSS variables
- Tailwind classes (`bg-background`, `text-foreground`)
- CSS module styles
- Server components (no JS runtime)
- Pure CSS animations and transitions

### Theme Hook Example

```typescript
import { useThemeColors } from '@/hooks/use-theme-colors';

function MyComponent() {
  const { colors, appointmentStatus, isDark } = useThemeColors();
  return <div style={{ background: colors.card }}>...</div>;
}
```

## Token Mapping Reference

| botanical.ts | globals.css | Usage |
|--------------|-------------|-------|
| `colors.page` | `--color-background` | Page background |
| `colors.card` | `--color-card` | Card surfaces |
| `colors.heading` | `--color-foreground` | Headings |
| `colors.primaryBase` | `--color-primary` | Primary accent |
| `radii.card` | `--radius-card` | Card border radius |
| `typography.heading` | `--font-heading` | Heading font |
| `appointmentStatus.*` | `--status-*` tokens | Status colors |

## Migration Path

1. **Incremental:** When refactoring, prefer CSS variables for Tailwind/CSS components
2. **Keep botanical.ts for:** JS-driven styling, theme logic, FullCalendar, client palettes
3. **Avoid:** Duplicating tokens with different values - update both sources together