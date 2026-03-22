# Design Tokens

This document describes the design token strategy for the KQ System botanical design system.

## Current State

Design tokens live in two places:

### 1. `src/styles/botanical.ts` (JavaScript/TypeScript)

- **Purpose:** JS/TS consumers for inline styles, themes, and programmatic use (e.g. StatCard, DataTable, calendar event colors).
- **Contents:** `colors`, `darkColors`, status palettes (`appointmentStatus`, `invoiceStatus`, `darkAppointmentStatus`, `darkInvoiceStatus`), `shadows`, `darkShadows`, `radii`, `typography`, `skeleton`, `darkSkeleton`, etc.
- **Format:** HSL strings (`hsl(...)`), rgba strings, hex, and references to `var(--font-*)`.

### 2. `src/app/globals.css` (CSS)

- **Purpose:** Tailwind theme, CSS utilities, and components that use CSS variables.
- **Contents:** `@theme` block with Tailwind 4 variables (`--color-background`, `--color-foreground`, etc.), `--status-*` semantic tokens (confirmed, completed, pending, overdue, group), panel accents, shadows, radii, typography.

## Strategy

1. **Source of truth:** CSS variables in `globals.css` are the source of truth for Tailwind and CSS-based styling.
2. **JS consumers:** `botanical.ts` remains for JS-only consumers (inline styles, dynamic palettes, theme-aware logic). It may import/compute from CSS where practical, or stay as a parallel token set.
3. **Incremental migration:** No big-bang refactor. When touching a component, prefer CSS variables if it's a pure-CSS/Tailwind component. Keep botanical.ts where it already drives JS behavior.

## Mapping: botanical.ts ↔ globals.css

| botanical.ts | globals.css | Notes |
|--------------|-------------|-------|
| `colors.page` | `--color-background` | `42 26% 95%` (HSL raw in @theme) |
| `colors.card` | `--color-card` | `36 32% 99%` |
| `colors.heading` | `--color-foreground` | `145 15% 20%` |
| `colors.body` | `--color-chip-text` / similar | `145 15% 28%` |
| `colors.primary` | `--color-border` | Border color; `34 22% 87%` |
| `colors.primaryBase` | `--color-primary` | `130 20% 46%` (sage green) |
| `radii.card` | `--radius-card` | 12px |
| `radii.button` | `--radius-button` | 8px |
| `typography.heading` | `--font-heading` | Playfair Display |
| `typography.body` | `--font-body` | Source Sans 3 |
| `typography.sizes.body` | `--font-size-body` | 0.875rem |
| `typography.sizes.meta` | `--font-size-meta` | 0.8rem |
| `typography.sizes.badge` | `--font-size-badge` | 0.7rem |
| `appointmentStatus.*` | `--status-confirmed-*`, `--status-completed-*`, `--status-pending-*`, `--status-overdue-*` | CSS has semantic invoice/status names; botanical has appointment/invoice palettes |
| `invoiceStatus.*` | Same `--status-*` tokens | Aligned conceptually |

## Chip Tokens (Semantic Aliases)

For filter chips, date range selectors, and similar UI:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-chip-border` | `hsl(34 22% 74%)` | Chip border (inactive) |
| `--color-chip-bg` | `hsl(42 26% 92%)` | Chip background (inactive) |
| `--color-chip-bg-hover` | `hsl(42 26% 87%)` | Chip hover background |
| `--color-chip-text` | `hsl(145 15% 28%)` | Chip text (inactive) |

Components like FilterChip can later use these via `var(--color-chip-border)`, `var(--color-chip-bg)`, etc.

## Migration Path

- **Incremental:** When refactoring a component, prefer CSS variables if the component is styled via Tailwind or plain CSS.
- **Keep botanical.ts for:** Inline styles, theme-aware helpers (`getAppointmentStatusColors`, `getClientPalette`), FullCalendar styling, and any JS-driven color selection.
- **Avoid:** Duplicating tokens with slightly different values. When adding a new semantic token (e.g. chip colors), add it to globals.css and optionally mirror in botanical.ts only if a JS consumer needs it.
