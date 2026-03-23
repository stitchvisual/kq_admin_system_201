# KQ System — UX/UI/Design Polish Audit

*Generated: March 24, 2026*

This audit identifies opportunities to polish the user experience, visual design, and interface consistency across the KQ Admin System.

---

## Executive Summary

The KQ System has a solid botanical design foundation with warm, earthy tones and thoughtful typography. However, there are several areas where polish and consistency can be improved to elevate the overall user experience.

**Priority Legend:**
- 🔴 High — Significantly impacts user experience or brand perception
- 🟡 Medium — Noticeable improvement opportunity
- 🟢 Low — Nice-to-have refinement

---

## 1. Visual Design & Consistency

### 1.1 Color System Fragmentation 🔴

**Issue:** Color values are duplicated and slightly inconsistent between `globals.css` and `botanical.ts`.

**Examples found:**
```css
/* globals.css uses HSL raw values */
--color-primary: 130 20% 46%;

/* botanical.ts uses full HSL strings */
colors.primaryBase: 'hsl(130, 20%, 46%)'
```

**Impact:** Risk of drift between CSS and JS consumers, leading to subtle visual inconsistencies.

**Recommendation:**
- Establish CSS variables as the single source of truth
- Update `botanical.ts` to read from CSS variables via `getComputedStyle()` or maintain strict documentation
- Add a build-time check to validate color consistency

---

### 1.2 Hardcoded Color Values 🔴

**Issue:** Multiple pages contain inline hardcoded colors instead of using design tokens.

**Examples:**
- `appointments/page.tsx`: `#5a7fa8`, `#5a8a60`, `#b69470`, `#a88c9e`
- `clients/page.tsx`: Direct `colors.faint` reference mixed with Tailwind classes
- `invoices/page.tsx`: `bg-sky-600`, `bg-emerald-600` for bulk action buttons

**Impact:** Inconsistent appearance, harder theme maintenance, accessibility issues.

**Recommendation:**
- Replace all hardcoded hex values with semantic CSS variables
- Create status color utilities: `bg-status-confirmed`, `text-status-overdue`, etc.
- Document the status color system in design-tokens.md

---

### 1.3 Inconsistent Border Radius Usage 🟡

**Issue:** Border radius values are applied inconsistently across components.

**Found:**
- `rounded-lg` (Tailwind default ~8px)
- `rounded-xl` (~12px)
- `rounded-[20px]` (hardcoded for mobile sheets)
- Custom: `--radius-button: 8px`, `--radius-card: 12px`

**Recommendation:**
- Standardize on semantic tokens: `rounded-card`, `rounded-button`, `rounded-panel`
- Use Tailwind's `@theme` to map these properly
- Document when to use each radius

---

### 1.4 Shadow System Underutilized 🟡

**Issue:** Custom shadow tokens exist but are inconsistently applied.

**Found in globals.css:**
```css
--shadow-soft
--shadow-soft-md
--shadow-soft-lg
--shadow-lift
--shadow-card
--shadow-card-hover
```

**But pages use:**
- `shadow-sm` (Tailwind default)
- No shadow on many cards
- Inconsistent elevation hierarchy

**Recommendation:**
- Establish elevation system: cards → elevated cards → modals → dropdowns
- Apply `shadow-card` to all card containers
- Use `shadow-lift` for hover states consistently

---

## 2. Typography & Readability

### 2.1 Font Size Inconsistency 🟡

**Issue:** Multiple font size approaches coexist.

**Found:**
- CSS variables: `--font-size-badge: 0.7rem`, `--font-size-body: 0.875rem`
- Tailwind classes: `text-xs`, `text-sm`, `text-[11px]`, `text-[12px]`
- Inline styles: `fontSize: 'var(--font-size-badge)'`

**Recommendation:**
- Standardize on a type scale with semantic names
- Create Tailwind utilities: `text-badge`, `text-meta`, `text-body`
- Avoid inline font-size styles

---

### 2.2 Heading Hierarchy 🟡

**Issue:** Page headings use inconsistent sizing and styling.

**Examples:**
- Appointments: `text-lg font-semibold`
- Clients: Uses `PageHeader` component with `text-2xl`
- Invoices: `text-2xl font-semibold`

**Recommendation:**
- Standardize all pages to use `PageHeader` component
- Document heading sizes: H1 (page title), H2 (section), H3 (subsection)
- Ensure consistent `font-heading` usage

---

### 2.3 Label/Metadata Text Styling 🟢

**Issue:** Section labels use varying styles.

**Found:**
- `text-[10px] font-bold tracking-[0.08em] uppercase`
- `text-[10.5px] font-bold tracking-[0.06em] uppercase`
- `text-xs font-bold uppercase tracking-wider`

**Recommendation:**
- Create a `SectionLabel` component or `.label` utility class
- Standardize: `text-[10px] font-bold tracking-[0.08em] uppercase text-secondary`

---

## 3. Layout & Spacing

### 3.1 Inconsistent Panel Widths 🟡

**Issue:** Slide-out panels have slightly different widths.

**Found:**
- Appointments: `md:w-[360px]`
- Clients: `md:w-[360px]`
- Invoices: `md:w-[360px]`

**Good:** Width is consistent, but implementation varies slightly in animation/transition code.

**Recommendation:**
- Extract a shared `SlidePanel` component
- Standardize transition timing and easing

---

### 3.2 Content Padding Inconsistency 🟡

**Issue:** Page content padding varies across pages.

**Found:**
- Appointments sidebar: `p-5`
- Clients content: `p-6 md:p-8`
- Invoices content: `p-6`

**Recommendation:**
- Standardize: `p-6` on mobile, `p-8` on desktop
- Use consistent gap spacing: `gap-4` for sections, `gap-2` for elements

---

### 3.3 Mobile Bottom Navigation Z-Index Conflicts 🟡

**Issue:** Complex z-index management for mobile panels vs bottom nav.

**Found:** Custom context (`MobilePanelContext`) and dynamic z-index manipulation.

**Recommendation:**
- Document z-index layers clearly:
  - Base content: `z-0`
  - Panels/Modals: `z-40`
  - Bottom nav: `z-50`
  - Toast: `z-60`
- Consider using CSS custom properties for z-index values

---

## 4. Interactive Elements

### 4.1 Button Styling Inconsistency 🔴

**Issue:** Multiple button implementations across pages.

**Found:**
- `Button` component from `@/components/ui/button`
- Custom `PrimaryBtn`, `SecondaryBtn`, `DangerBtn` from panels
- Inline styled buttons with hardcoded colors
- Tailwind button classes: `bg-sky-600`, `bg-emerald-600`

**Recommendation:**
- Consolidate to single Button component with variants
- Create semantic variants: `variant="primary"`, `variant="success"`, `variant="danger"`
- Remove inline button styles

---

### 4.2 Form Input Styling 🟡

**Issue:** Input styles duplicated across forms.

**Found:**
```tsx
const inputClasses = 'w-full h-9 px-3 rounded-lg border border-[hsl(37_18%_85%)] bg-[hsl(40_20%_98%)]...';
```

**Duplicated in:**
- `appointments/page.tsx`
- Likely other form panels

**Recommendation:**
- Create global input styles in globals.css or a form input component
- Use CSS variables for input colors: `--color-input-border`, `--color-input-bg`

---

### 4.3 Hover/Focus States 🟡

**Issue:** Inconsistent hover and focus state implementations.

**Found:**
- Some elements use `transition-all duration-150`
- Others use `transition-colors duration-200`
- Focus rings vary: some use `focus:ring-2`, others use custom outlines

**Recommendation:**
- Standardize transition: `transition-colors duration-150` for color changes
- Use `transition-transform duration-200` for transforms
- Implement consistent focus ring: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

---

### 4.4 Loading States 🟢

**Issue:** Loading indicators vary across pages.

**Found:**
- `Loader2` with `animate-spin`
- Custom skeleton components
- `animate-pulse` on placeholder elements

**Recommendation:**
- Standardize skeleton components for each content type
- Consider a unified loading state pattern with shimmer effect
- Add loading state to buttons consistently

---

## 5. Component Architecture

### 5.1 Duplicate Panel Implementations 🔴

**Issue:** Panel logic is duplicated across pages.

**Each page implements:**
- `panelMode` state management
- `panelVisible`, `panelClosing` states
- `openPanel()`, `closePanel()` functions
- Mobile backdrop and sheet markup
- Desktop aside markup

**Recommendation:**
- Create a shared `useSlidePanel` hook
- Create a `SlidePanel` component that handles:
  - Mobile bottom sheet
  - Desktop side panel
  - Backdrop
  - Animations
  - Z-index management

---

### 5.2 Status Badge Inconsistency 🟡

**Issue:** Status badges implemented differently across pages.

**Found:**
- `StatusPill` component in appointments
- `InvoiceStatusBadge` component
- `RateCodeStatus` component
- Inline styled status indicators

**Recommendation:**
- Create a unified `StatusBadge` component
- Support variants: `confirmed`, `pending`, `completed`, `overdue`, `cancelled`
- Use CSS variables for status colors consistently

---

### 5.3 Empty State Components 🟢

**Good:** `EmptyClients`, `EmptyInvoices` components exist.

**Recommendation:**
- Standardize empty state pattern with illustration, message, and CTA
- Consider a generic `EmptyState` component with slots

---

## 6. Accessibility

### 6.1 Focus Visible States 🟡

**Issue:** Some interactive elements lack proper focus indicators.

**Found:**
- Custom `focus-ring` and `focus-enhanced` classes exist but aren't consistently applied
- Some buttons rely on color change only for focus indication

**Recommendation:**
- Audit all interactive elements for focus-visible states
- Use `focus-visible:` instead of `focus:` for keyboard-only focus rings
- Ensure focus indicator has sufficient contrast

---

### 6.2 ARIA Labels 🟡

**Issue:** Inconsistent ARIA labeling.

**Found:**
- Some buttons have `aria-label`
- Icon-only buttons sometimes lack accessible names
- Panel close buttons inconsistently labeled

**Recommendation:**
- Audit all icon-only buttons for `aria-label`
- Add `aria-labelledby` to panels
- Ensure form inputs have associated labels

---

### 6.3 Color Contrast 🟡

**Issue:** Some text may not meet WCAG AA contrast requirements.

**Areas to check:**
- `text-faint` on background
- Status badge text on badge backgrounds
- Secondary/muted text

**Recommendation:**
- Run contrast audit on all text/token combinations
- Adjust colors as needed to meet 4.5:1 for body text, 3:1 for large text

---

## 7. Animation & Motion

### 7.1 Animation Timing Inconsistency 🟡

**Issue:** Animation durations vary across the codebase.

**Found:**
- Panel transitions: `280ms`
- Fade animations: `150ms`, `200ms`
- Stagger children: `500ms`
- Theme transitions: `300ms`

**Recommendation:**
- Standardize animation timing:
  - Micro-interactions: `150ms`
  - Standard transitions: `200ms`
  - Panel/modal: `280ms`
  - Page transitions: `300-400ms`
- Document in design-tokens.md

---

### 7.2 Easing Functions 🟢

**Good:** Consistent use of `cubic-bezier(0.16, 1, 0.3, 1)` for panels.

**Recommendation:**
- Define standard easings as CSS variables:
  - `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`
  - `--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)`

---

### 7.3 Reduced Motion Support 🟢

**Good:** `prefers-reduced-motion` media query exists in globals.css.

**Recommendation:**
- Audit that all animations respect this setting
- Test with reduced motion enabled

---

## 8. Mobile Experience

### 8.1 Touch Target Sizes 🟡

**Issue:** Some touch targets may be too small.

**Areas to check:**
- Mini calendar day buttons (appear small)
- Pagination buttons (`w-8 h-8` = 32px, minimum is 44px recommended)
- Icon buttons in panels

**Recommendation:**
- Ensure minimum 44x44px touch targets
- Add padding to small buttons on mobile
- Consider larger hit areas for frequently used actions

---

### 8.2 Safe Area Insets 🟢

**Good:** `env(safe-area-inset-bottom)` is used for bottom navigation.

---

### 8.3 Mobile Panel Gestures 🟡

**Issue:** No swipe-to-close gesture for mobile bottom sheets.

**Recommendation:**
- Add drag-to-dismiss gesture for mobile panels
- Use `onDrag` to translate panel down
- Close when drag exceeds threshold

---

## 9. Performance & Polish

### 9.1 Skeleton Loading 🟡

**Issue:** Skeleton states exist but aren't universally applied.

**Recommendation:**
- Add skeleton states to all data-loading scenarios
- Use consistent shimmer animation
- Match skeleton shape to content shape

---

### 9.2 Optimistic Updates 🟢

**Good:** Appointments page implements optimistic updates for drag-drop.

**Recommendation:**
- Extend optimistic updates to other actions (delete, complete, etc.)
- Add rollback animation on error

---

### 9.3 Image/Avatar Loading 🟢

**Good:** Avatar component with fallback exists.

---

## 10. Recommended Action Plan

### Phase 1: Foundation (High Impact)
1. ✅ Consolidate color system — eliminate hardcoded values
2. ✅ Create unified Button component with variants
3. ✅ Create shared SlidePanel component/hook
4. ✅ Establish consistent status badge system

### Phase 2: Consistency (Medium Impact)
5. Standardize typography scale and usage
6. Unify form input styling
7. Document spacing/padding standards
8. Audit and fix accessibility issues

### Phase 3: Polish (Lower Impact)
9. Add swipe-to-close for mobile panels
10. Standardize animation timing
11. Add micro-interactions (button press, success states)
12. Create design system documentation

---

## Quick Wins (Can implement immediately)

### 1. Replace hardcoded colors in appointments page
```tsx
// Before
color="#5a7fa8"

// After
className="text-status-confirmed"
// or
style={{ color: 'var(--status-confirmed-dot)' }}
```

### 2. Standardize section labels
```tsx
// Create reusable component
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-secondary mb-2">
      {children}
    </p>
  );
}
```

### 3. Extract panel hook
```tsx
// Create hooks/useSlidePanel.ts
export function useSlidePanel() {
  const [mode, setMode] = useState<PanelMode>('empty');
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  
  const open = useCallback((newMode: PanelMode) => {
    setClosing(false);
    setMode(newMode);
    setTimeout(() => setVisible(true), 75);
  }, []);
  
  const close = useCallback(() => {
    setVisible(false);
    setClosing(true);
    setTimeout(() => {
      setMode('empty');
      setClosing(false);
    }, 300);
  }, []);
  
  return { mode, visible, closing, open, close, isOpen: mode !== 'empty' };
}
```

---

## Conclusion

The KQ System has a strong design foundation with its botanical theme. The main opportunities for improvement lie in:

1. **Consolidation** — Reducing code duplication through shared components
2. **Token discipline** — Eliminating hardcoded values in favor of design tokens
3. **Accessibility** — Ensuring all users can effectively use the system
4. **Mobile polish** — Improving the touch experience and gestures

Addressing these areas will significantly elevate the perceived quality and maintainability of the application.