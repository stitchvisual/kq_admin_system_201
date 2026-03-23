# KQ System Performance Audit Plan

> **Purpose:** Structured audit to identify and prioritize improvements for faster loading and smoother interactions across the KQ Portal (NDIS client management system).

**Goal:** Systematically assess and remediate performance bottlenecks in loading, data fetching, bundle size, and interaction responsiveness.

**Approach:** Phased audit following Vercel React Best Practices priorities—waterfalls first, bundle size second, then server/client optimizations. Use Lighthouse, bundle analyzer, and runtime profiling.

**Tech Stack:** Next.js 15 App Router, React 19, FullCalendar, Framer Motion, Supabase, Drizzle ORM, Sentry

---

## Phase 0: Baseline Metrics (Do First)

Establish measurable baselines before making changes. Document in `docs/performance-baselines.md`.

| Metric | Tool | Target |
|--------|------|--------|
| Lighthouse Performance (mobile) | `npx lighthouse https://your-preview-url --view` | ≥70 |
| First Contentful Paint (FCP) | Lighthouse | <1.8s |
| Largest Contentful Paint (LCP) | Lighthouse | <2.5s |
| Time to Interactive (TTI) | Lighthouse | <3.8s |
| Total Blocking Time (TBT) | Lighthouse | <300ms |
| JavaScript bundle size | `npm run build` + analyze output | Track before/after |
| First Load JS (shared) | Next.js build output | Minimize |

**Commands:**
```bash
npm run build
# Check .next/build-manifest.json and build output for chunk sizes
```

---

## Phase 1: Critical — Eliminating Waterfalls

**Impact: CRITICAL.** Sequential awaits add full network latency. Dashboard API already uses `Promise.all()` — good.

### 1.1 Client-Side Fetch Waterfalls

**Finding:** Multiple pages fire independent `useEffect` fetches that run sequentially (React batches, but each blocks render until complete).

| Page | Current Pattern | Issue |
|------|-----------------|-------|
| Dashboard | `fetchDashboard()` in useEffect | Single fetch—OK. No SWR/cache; refetch on every visit. |
| Appointments | 3 useEffects: `fetchAppointments`, `fetchClients`, `fetchRateCodes` | Sequential mount; clients + rateCodes could run in parallel. |
| Clients | 2 useEffects: `fetchClients`, `fetchPricingCodes` | Sequential. |
| Invoices | Multiple state + fetch patterns | Stats, invoices, uninvoiced sessions—potential waterfalls. |

**Recommendations:**
- [ ] **Appointments:** Combine `fetchClients` + `fetchRateCodes` into one `Promise.all` in a single useEffect, or fetch both in parallel on mount.
- [ ] **Clients:** Same—fetch clients and pricing codes in parallel.
- [ ] **Invoices:** Audit `UnifiedInvoicesPage` for sequential fetches; parallelize where independent.
- [ ] **Consider SWR** (`client-swr-dedup`): Use SWR for list/dashboard data to get deduplication, caching, revalidation. Reduces redundant fetches on tab switches.

### 1.2 API Route Waterfalls

**Finding:** Dashboard summary route uses `Promise.all()` — good. Spot-check other routes:

| Route | Status |
|-------|--------|
| `GET /api/dashboard/summary` | ✅ Parallel with Promise.all |
| `GET /api/appointments` | Single query — OK |
| `GET /api/clients/[id]/detail` | Single query — OK |
| Invoice routes | Audit for sequential DB calls |

**Action:** Review `invoices.service.ts`, `clients.service.ts`, `appointments.service.ts` for any `await A; await B` patterns where A and B are independent.

---

## Phase 2: Critical — Bundle Size Optimization

**Impact: CRITICAL.** Large JS delays TTI and increases mobile data usage.

### 2.1 Barrel File Imports (`bundle-barrel-imports`)

**Finding:** Two barrel files pull in more than needed:

- `@/components/botanical` — Exports EmptyState, DataTable. Botanical is small (2 components).
- `@/components/invoices` — Exports 10+ components. Invoices page imports: `InvoiceRow`, `InvoiceDetailPanel`, `BulkIssueModal`, `BulkMarkPaidModal`, `SessionSelectionBar`, `ClientSessionGroup`, `GenerateDateRangeSelector`. Likely tree-shaken, but barrel adds indirection.

**Recommendations:**
- [ ] **Invoices:** Replace `from '@/components/invoices'` with direct imports per component where used (e.g. `from '@/components/invoices/InvoiceDetailPanel'`). Reduces risk of pulling unused code.
- [ ] **Botanical:** Already minimal; low priority. Consider direct imports if easy.

### 2.2 Heavy Third-Party Libraries (`bundle-dynamic-imports`, `bundle-defer-third-party`)

**Finding:**
- **FullCalendar** — 6 packages (`core`, `daygrid`, `timegrid`, `list`, `interaction`, `react`). Loaded eagerly on Appointments page. ~100–150KB gzipped.
- **Framer Motion** — Used on Invoices page (`AnimatePresence`, `motion`). ~30–50KB.
- **@react-pdf/renderer** — Already externalized in `next.config`; used only for PDF generation. Good.
- **lucide-react** — Tree-shakeable; ensure named imports (e.g. `import { Leaf } from 'lucide-react'`). ✅ Already correct.

**Recommendations:**
- [ ] **ScheduleCalendar:** Use `next/dynamic` with `ssr: false` for the FullCalendar wrapper. Load only when user navigates to `/admin/appointments`.
- [ ] **Framer Motion:** Consider `next/dynamic` for invoice page animations, or replace simple animations with CSS `@keyframes` / `transition` where possible.
- [ ] **Sentry:** Verify `bundle-defer-third-party` — load Sentry after hydration if not already. Check Sentry Next.js config.

### 2.3 Route-Level Code Splitting

**Finding:** App Router automatically code-splits by route. Appointments page is heavy; ensure it’s in its own chunk.

**Action:** Run `npm run build` and inspect chunk for `/admin/appointments`. Confirm ScheduleCalendar + FullCalendar are not in the main layout chunk.

---

## Phase 3: High — Server-Side Performance

### 3.1 Admin Layout Auth Waterfall

**Finding:** `AdminLayout` is a Server Component that `await createClient()` and `await supabase.auth.getUser()` before rendering. This blocks the entire admin shell.

**Recommendation:**
- [ ] Consider `loading.tsx` for admin layout so a skeleton shows immediately while auth resolves. Or use middleware for auth redirect and make layout lighter.

### 3.2 Per-Request Caching

**Finding:** No `React.cache()` or request deduplication visible. If multiple components fetch the same data in one request, they could duplicate.

**Action:** Audit Server Components (if any) and API routes for repeated fetches. Add `React.cache()` for shared fetchers where appropriate.

---

## Phase 4: Medium-High — Client Data Fetching

### 4.1 SWR for Deduplication

**Recommendation:** Add SWR (or React Query) for:
- Dashboard summary
- Client list
- Invoice list + summary stats

Benefits: Request deduplication, stale-while-revalidate, reduced loading states on revisit.

### 4.2 Event Listeners

**Finding:** `ScheduleCalendar` uses `useResponsiveView()` with `window.addEventListener('resize', check)`. Ensure no duplicate listeners.

**Action:** Verify only one subscription. Consider `useSyncExternalStore` for responsive values if needed.

---

## Phase 5: Medium — Re-render & Rendering

### 5.1 Large Component Files

**Finding:** 
- `appointments/page.tsx` — ~1200 lines, multiple inline subcomponents (`ViewPanel`, `FormPanel`, `DeletePanel`, `CompletePanel`).
- `invoices/page.tsx` — ~1250 lines.

**Recommendation:** Extract panels to separate files. Enables:
- Better code splitting
- `React.memo` on stable panel components
- Clearer dependency boundaries

### 5.2 useTransition for Non-Urgent Updates

**Finding:** Filter changes (e.g. status tabs on Invoices) trigger full re-renders and may feel janky.

**Recommendation:** Wrap filter/status changes in `startTransition` so React can keep UI responsive during list updates.

### 5.3 content-visibility for Long Lists

**Finding:** Client table, invoice list can be long. No `content-visibility` detected.

**Recommendation:** Add `content-visibility: auto` to list item containers for off-screen rows. Reduces paint cost for long lists.

---

## Phase 6: Low-Medium — JS & Rendering Polish

### 6.1 CSS

**Finding:** `globals.css` is ~778 lines; imports `fullcalendar-botanical.css`. FullCalendar CSS is only needed on appointments page.

**Recommendation:** Import FullCalendar custom CSS only in `ScheduleCalendar.tsx` or the appointments layout, not globally.

### 6.2 Search / Pagination Debouncing

**Finding:** Clients page: `search` and `page` trigger `fetchClients` on every change. Rapid typing causes many requests.

**Recommendation:** Debounce search input (300ms). Consider `useDeferredValue` for search to keep input responsive.

---

## Summary: Prioritized Action List

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Baseline metrics (Phase 0) | 1h | Required for validation |
| P1 | Parallelize Appointments fetches (clients + rateCodes) | 1h | High |
| P1 | Parallelize Clients fetches | 30m | Medium |
| P1 | Dynamic import ScheduleCalendar (FullCalendar) | 1h | High |
| P2 | Add SWR to Dashboard + Clients | 2h | High |
| P2 | Move FullCalendar CSS to appointments scope | 30m | Medium |
| P2 | Replace invoice barrel imports with direct | 1h | Medium |
| P3 | Debounce client search | 30m | Medium |
| P3 | Extract appointment panels to files | 2h | Maintainability |
| P3 | `content-visibility` on long lists | 1h | Medium (long lists) |
| P4 | `startTransition` for filter changes | 1h | Low-Medium |
| P4 | Admin layout loading skeleton | 1h | Perceived performance |

---

## Files to Touch (by Phase)

### Phase 1
- `src/app/(admin)/admin/appointments/page.tsx` — parallel fetches
- `src/app/(admin)/admin/clients/page.tsx` — parallel fetches
- `src/app/(admin)/admin/invoices/page.tsx` — audit + parallelize
- `src/app/(admin)/admin/page.tsx` — optional SWR

### Phase 2
- `src/app/(admin)/admin/appointments/page.tsx` — dynamic import ScheduleCalendar
- `src/app/(admin)/admin/appointments/_components/ScheduleCalendar.tsx` — CSS import
- `src/app/globals.css` — remove fullcalendar import if moved
- `src/app/(admin)/admin/invoices/page.tsx` — direct imports
- `next.config.ts` — verify Sentry deferral

### Phase 3–6
- `src/app/(admin)/admin/layout.tsx` — loading.tsx or skeleton
- Various — SWR setup, debounce, content-visibility

---

## Reference

- Vercel React Best Practices: `vercel-react-best-practices` skill
- Full document: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md
- Next.js bundle analysis: `@next/bundle-analyzer` (add to next.config for detailed analysis)
