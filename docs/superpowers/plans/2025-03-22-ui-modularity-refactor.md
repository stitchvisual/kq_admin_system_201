# UI Modularity & Design Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the codebase to reduce duplication, improve modularity, and enforce design consistency across UI components.

**Architecture:** Extract shared utilities and primitives into `lib/` and `components/` respectively. Move domain-agnostic panel primitives out of admin routes. Unify avatar, badge, and chip patterns into single reusable components. Consolidate design tokens with CSS variables as source of truth.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui (Radix), botanical design system

---

## File Structure (Create/Modify Map)

### New Files
| Path | Responsibility |
|------|----------------|
| `src/lib/date-range-utils.ts` | Shared date range calculation logic (getWeekStart, addDays, getOptionRange, formatDateForInput) |
| `src/components/panels/index.tsx` | Panel primitives: PanelHeader, SheetHandle, PanelContent, SectionLabel, MetaRow, PanelDivider, PanelFooter, PrimaryBtn, SecondaryBtn, DangerBtn |
| `src/components/ui/filter-chip.tsx` | Reusable FilterChip/ToggleChip for active/inactive filter state |
| `src/components/shared/SectionLabel.tsx` | Unified small-caps label (used by panels, DataTable) |
| `src/components/avatars/ClientAvatar.tsx` | Unified ClientAvatar + ClientMiniAvatar using ui/avatar |
| `src/components/ui/status-badge.tsx` | Base StatusBadge component (config-driven) |
| `docs/design-tokens.md` | Token consolidation strategy and mapping |

### Modified Files
| Path | Changes |
|------|---------|
| `src/components/invoices/DateRangeQuickSelect.tsx` | Import from lib/date-range-utils, optionally use FilterChip |
| `src/components/invoices/GenerateDateRangeSelector.tsx` | Import from lib/date-range-utils, optionally use FilterChip |
| `src/app/(admin)/admin/clients/_components/clientPanelShared.tsx` | **DELETE** after migration |
| `src/app/(admin)/admin/clients/_components/ClientDetailPanel.tsx` | Update import path for panel primitives |
| `src/app/(admin)/admin/clients/_components/ClientFormPanel.tsx` | Update import path |
| `src/app/(admin)/admin/clients/_components/ClientDeletePanel.tsx` | Update import path |
| `src/components/invoices/InvoiceDetailPanel.tsx` | Update import path |
| `src/app/(admin)/admin/appointments/page.tsx` | Update import path |
| `src/components/shared/PageHeader.tsx` | Remove ClientAvatar, ClientMiniAvatar; import from avatars/ |
| `src/components/botanical/DataTable.tsx` | Use shared SectionLabel or deprecate DataTableHeaderLabel in favor of SectionLabel |
| `src/components/invoices/InvoiceStatusBadge.tsx` | Use StatusBadge base (optional, lower priority) |
| `src/app/globals.css` | Add/align semantic token aliases (incremental) |

---

## Execution Order

Tasks are ordered by dependency and risk. Each task produces working, testable software.

1. **Task 1:** Extract shared date-range utils
2. **Task 2:** Move panel shared to components/panels
3. **Task 3:** Shared SectionLabel
4. **Task 4:** Add FilterChip component
5. **Task 5:** Unify avatars
6. **Task 6:** Shared StatusBadge base
7. **Task 7:** Consolidate design tokens (document strategy + incremental aliases)

---

## Task 1: Extract Shared Date-Range Utils

**Files:**
- Create: `src/lib/date-range-utils.ts`
- Modify: `src/components/invoices/DateRangeQuickSelect.tsx`
- Modify: `src/components/invoices/GenerateDateRangeSelector.tsx`

- [ ] **Step 1.1: Create `src/lib/date-range-utils.ts`**

```typescript
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
```

- [ ] **Step 1.2: Refactor DateRangeQuickSelect to use shared utils**

Replace local `getWeekStart`, `addDays`, `getOptionRange`, `formatDateForInput`, `optionLabels` with imports from `@/lib/date-range-utils`. Remove duplicate code.

- [ ] **Step 1.3: Refactor GenerateDateRangeSelector to use shared utils**

Replace local implementations with imports. Use `QUICK_OPTION_LABELS_SENTENCE` for labels to preserve current "This week" casing.

- [ ] **Step 1.4: Verify**

Manually test both date range selectors on the invoices page (or wherever they are used). Confirm preset options produce correct ranges.

- [ ] **Step 1.5: Commit**

```bash
git add src/lib/date-range-utils.ts src/components/invoices/DateRangeQuickSelect.tsx src/components/invoices/GenerateDateRangeSelector.tsx
git commit -m "refactor: extract shared date-range utils to lib/date-range-utils"
```

---

## Task 2: Move Panel Shared to components/panels

**Files:**
- Create: `src/components/panels/index.tsx` (copy content from clientPanelShared)
- Modify: 5 consumers (ClientDetailPanel, ClientFormPanel, ClientDeletePanel, InvoiceDetailPanel, appointments/page)
- Delete: `src/app/(admin)/admin/clients/_components/clientPanelShared.tsx`

- [ ] **Step 2.1: Create `src/components/panels/index.tsx`**

Copy the entire content of `src/app/(admin)/admin/clients/_components/clientPanelShared.tsx` into the new file. Change any relative imports if present (there are none). Ensure exports match.

- [ ] **Step 2.2: Update ClientDetailPanel import**

In `src/app/(admin)/admin/clients/_components/ClientDetailPanel.tsx`, change:
```ts
} from './clientPanelShared';
```
to:
```ts
} from '@/components/panels';
```

- [ ] **Step 2.3: Update ClientFormPanel import**

Same change: `'./clientPanelShared'` → `'@/components/panels'`

- [ ] **Step 2.4: Update ClientDeletePanel import**

Same change.

- [ ] **Step 2.5: Update InvoiceDetailPanel import**

In `src/components/invoices/InvoiceDetailPanel.tsx`, change:
```ts
} from '@/app/(admin)/admin/clients/_components/clientPanelShared';
```
to:
```ts
} from '@/components/panels';
```

- [ ] **Step 2.6: Update appointments page import**

In `src/app/(admin)/admin/appointments/page.tsx`, change:
```ts
} from '@/app/(admin)/admin/clients/_components/clientPanelShared';
```
to:
```ts
} from '@/components/panels';
```

- [ ] **Step 2.7: Delete clientPanelShared.tsx**

- [ ] **Step 2.8: Verify**

Run dev server, open clients, invoices, appointments. Confirm panels open/close, forms submit, delete flows work.

- [ ] **Step 2.9: Commit**

```bash
git add src/components/panels/index.tsx src/app/\(admin\)/admin/clients/_components/*.tsx src/components/invoices/InvoiceDetailPanel.tsx src/app/\(admin\)/admin/appointments/page.tsx
git rm src/app/\(admin\)/admin/clients/_components/clientPanelShared.tsx
git commit -m "refactor: move panel primitives to components/panels"
```

---

## Task 3: Shared SectionLabel

**Files:**
- Create: `src/components/shared/SectionLabel.tsx`
- Modify: `src/components/panels/index.tsx` (use SectionLabel instead of inline SectionLabel)
- Modify: `src/components/botanical/DataTable.tsx` (use SectionLabel, deprecate DataTableHeaderLabel or make it wrap SectionLabel)

- [ ] **Step 3.1: Create SectionLabel component**

```tsx
// src/components/shared/SectionLabel.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  /** Render as span for inline/table use */
  as?: 'p' | 'span';
  /** Omit bottom margin when used in tables */
  noMargin?: boolean;
}

/** Small-caps label for sections, table headers, and metadata. */
export function SectionLabel({ children, className, as: Component = 'p', noMargin }: SectionLabelProps) {
  return (
    <Component
      className={cn(
        'text-[10px] font-medium uppercase tracking-[0.07em] text-muted-foreground',
        !noMargin && 'mb-1.5',
        className
      )}
    >
      {children}
    </Component>
  );
}
```

- [ ] **Step 3.2: Update panels to use SectionLabel**

In `src/components/panels/index.tsx`:
1. Remove the local `SectionLabel` function definition
2. Add: `export { SectionLabel } from '@/components/shared/SectionLabel';`

Consumers (ClientDetailPanel, InvoiceDetailPanel, etc.) continue to import `SectionLabel` from `@/components/panels` with no change.

- [ ] **Step 3.3: Grep for DataTableHeaderLabel usages**

Run: `rg DataTableHeaderLabel src/` to find consumers. Note which files import it.

- [ ] **Step 3.4: Update DataTable to use SectionLabel**

In `src/components/botanical/DataTable.tsx`:
1. Import SectionLabel from `@/components/shared/SectionLabel`
2. Replace `DataTableHeaderLabel` implementation with: `export function DataTableHeaderLabel(props) { return <SectionLabel as="span" noMargin {...props} />; }`
3. This keeps the `DataTableHeaderLabel` export for backward compatibility

- [ ] **Step 3.5: Verify and commit**

```bash
git add src/components/shared/SectionLabel.tsx src/components/panels/index.tsx src/components/botanical/DataTable.tsx
git commit -m "refactor: add shared SectionLabel component"
```

---

## Task 4: Add FilterChip Component

**Files:**
- Create: `src/components/ui/filter-chip.tsx`

- [ ] **Step 4.1: Create FilterChip component**

```tsx
// src/components/ui/filter-chip.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Size: sm (h-7 text-xs) | md (py-1.5 text-sm) */
  size?: 'sm' | 'md';
}

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, active = false, size = 'sm', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'rounded-md font-medium transition-all',
          size === 'sm' && 'h-7 px-3 text-xs',
          size === 'md' && 'px-3 py-1.5 text-sm',
          active
            ? 'bg-primary text-white shadow-sm'
            : 'border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)]',
          className
        )}
        {...props}
      />
    );
  }
);
FilterChip.displayName = 'FilterChip';

export { FilterChip };
```

- [ ] **Step 4.2: (Optional) Refactor DateRangeQuickSelect to use FilterChip**

Replace the button with `<FilterChip active={active} size="sm" onClick={...}>{optionLabels[option]}</FilterChip>`. This validates the component.

- [ ] **Step 4.3: (Optional) Refactor GenerateDateRangeSelector to use FilterChip**

Same for preset chips with `size="md"`.

- [ ] **Step 4.4: Export from ui index (if exists)**

If `src/components/ui/index.ts` exists, add FilterChip export.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/ui/filter-chip.tsx
git commit -m "feat: add FilterChip component for consistent filter UI"
```

---

## Task 5: Unify Avatars

**Files:**
- Create: `src/components/avatars/ClientAvatar.tsx`
- Modify: `src/components/shared/PageHeader.tsx` (remove ClientAvatar, ClientMiniAvatar; re-export from avatars or update imports)
- Modify: Any consumers of ClientAvatar/ClientMiniAvatar

- [ ] **Step 5.1: Grep for ClientAvatar and ClientMiniAvatar usages**

Identify all import sites.

- [ ] **Step 5.2: Create unified ClientAvatar component**

```tsx
// src/components/avatars/ClientAvatar.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CLIENT_COLORS = ['#7895aa', '#82a091', '#b69470', '#a08090', '#8a9ab0', '#9ab0a0'] as const;

function getClientColor(clientId: string): string {
  const hash = clientId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLIENT_COLORS[hash % CLIENT_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export interface ClientAvatarProps {
  name: string;
  clientId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-6 text-[0.625rem]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function ClientAvatar({ name, clientId, size = 'md', className }: ClientAvatarProps) {
  const color = getClientColor(clientId);
  const initials = getInitials(name);
  const sizeClass = sizeMap[size];

  return (
    <Avatar className={className}>
      <AvatarFallback className={cn(sizeClass, 'font-bold text-white')} style={{ backgroundColor: color }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export interface ClientMiniAvatarProps {
  name: string;
  clientId: string;
  className?: string;
}

/** Compact inline avatar for table rows. */
export function ClientMiniAvatar({ name, clientId, className }: ClientMiniAvatarProps) {
  const color = getClientColor(clientId);
  const initials = getInitials(name);

  return (
    <span
      className={cn('inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold text-white mr-2 align-middle', className)}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}
```

Note: Add `cn` import. ClientMiniAvatar stays as span (not Avatar) to preserve inline/table behavior.

- [ ] **Step 5.3: Update PageHeader**

Remove `ClientAvatar` and `ClientMiniAvatar` from PageHeader. Add re-exports for backward compatibility:
```ts
export { ClientAvatar, ClientMiniAvatar } from '@/components/avatars/ClientAvatar';
```

- [ ] **Step 5.4: Update any direct consumers**

If any file imports from PageHeader for avatars only, consider updating to `@/components/avatars/ClientAvatar`. Re-export from PageHeader keeps existing imports working.

- [ ] **Step 5.5: Verify**

Check clients page, invoice rows, any avatar usage. Confirm layout and colors match.

- [ ] **Step 5.6: Commit**

```bash
git add src/components/avatars/ClientAvatar.tsx src/components/shared/PageHeader.tsx
git commit -m "refactor: unify ClientAvatar in components/avatars"
```

---

## Task 6: Shared StatusBadge Base

**Files:**
- Create: `src/components/ui/status-badge.tsx`
- Modify: `src/components/invoices/InvoiceStatusBadge.tsx` (use StatusBadge base, optional)

- [ ] **Step 6.1: Create StatusBadge base component**

```tsx
// src/components/ui/status-badge.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusConfig {
  bg: string;
  text: string;
  border: string;
}

export interface StatusBadgeProps {
  label: string;
  config: StatusConfig;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: { fontSize: '0.65rem', padding: '2px 8px', iconSize: 10 },
  md: { fontSize: '0.72rem', padding: '3px 10px', iconSize: 12 },
  lg: { fontSize: 'var(--font-size-meta)', padding: '4px 12px', iconSize: 14 },
};

export function StatusBadge({ label, config, icon, size = 'md', className }: StatusBadgeProps) {
  const s = sizeStyles[size];
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-semibold capitalize border rounded-full', className)}
      style={{
        fontSize: s.fontSize,
        padding: s.padding,
        background: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {icon}
      {label}
    </span>
  );
}
```

- [ ] **Step 6.2: Refactor InvoiceStatusBadge to use StatusBadge (optional)**

InvoiceStatusBadge has overdue logic, subtext, compact variant. Keep InvoiceStatusBadge as the public API; internally compose StatusBadge for the visual part. This is a lower-priority refactor—can be deferred if time-constrained.

- [ ] **Step 6.3: Commit**

```bash
git add src/components/ui/status-badge.tsx
git commit -m "feat: add StatusBadge base component"
```

---

## Task 7: Consolidate Design Tokens

**Files:**
- Create: `docs/design-tokens.md`
- Modify: `src/app/globals.css` (add semantic aliases, document mapping)

- [ ] **Step 7.1: Create design tokens documentation**

Document in `docs/design-tokens.md`:
- Current state: `botanical.ts` (JS) vs `globals.css` @theme and --status-*
- Strategy: Use CSS variables as source of truth for Tailwind; botanical.ts imports/computes from CSS where needed, or botanical.ts remains for JS-only consumers (e.g. inline styles in StatCard)
- Mapping table: botanical key → CSS variable
- Migration path: incremental, no big-bang refactor

- [ ] **Step 7.2: Add semantic token aliases to globals.css**

Add aliases for commonly hardcoded values:
```css
--color-chip-border: hsl(34 22% 74%);
--color-chip-bg: hsl(42 26% 92%);
--color-chip-bg-hover: hsl(42 26% 87%);
--color-chip-text: hsl(145 15% 28%);
```

Update FilterChip (and optionally DateRangeQuickSelect, GenerateDateRangeSelector) to use these:
```css
border-[var(--color-chip-border)] bg-[var(--color-chip-bg)]
```

- [ ] **Step 7.3: Commit**

```bash
git add docs/design-tokens.md src/app/globals.css
git commit -m "docs: add design token consolidation strategy and chip token aliases"
```

---

## Verification Checklist

Before considering the plan complete:

- [ ] `pnpm build` (or `npm run build`) succeeds
- [ ] No TypeScript errors
- [ ] Manual smoke test: Clients list, client detail panel, add/edit client
- [ ] Manual smoke test: Invoices list, invoice detail panel, date range selectors
- [ ] Manual smoke test: Appointments, appointment detail panel
- [ ] Manual smoke test: Empty states, avatars in tables

---

## Rollback

Each task is independently committable. If issues arise, revert the specific commit for that task. Task 2 (panel move) has the most consumer changes; keep that commit isolated for easy revert.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2025-03-22-ui-modularity-refactor.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** – Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** – Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
