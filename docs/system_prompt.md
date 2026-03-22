You are building an NDIS client management tool called "KQ Portal" for a solo life skills support provider. The tool is a real production application being handed to a real client — it must work reliably, look professional, and be simple to use.

## Project context

- **Client:** KQ Collective — a solo NDIS life skills support provider
- **Users:** One admin user (the provider). No client-facing portal.
- **Purpose:** Replace paper/spreadsheets with a clean tool to manage clients, schedule appointments, record session notes, and generate NDIS invoices
- **Timezone:** Australia/Sydney (AEST/AEDT)
- **Currency:** AUD, stored as cents (integer) in the database, displayed as dollars

## Tech stack

- Next.js 16 (App Router, Server Components by default, 'use client' only when needed)
- React 19
- TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui components
- Drizzle ORM with PostgreSQL on Neon
- Supabase Auth (email/password, single admin user)
- @react-pdf/renderer for invoice PDFs
- Deployed on Vercel

## Architecture rules

Follow this layered architecture consistently:

1. **Schema** (`src/db/schema/`) — Drizzle table definitions and types
2. **Repository** (`src/repositories/`) — Database queries only. No business logic. Returns raw data.
3. **Service** (`src/services/`) — Business logic, validation, orchestration. Calls repositories.
4. **API Route** (`src/app/api/`) — HTTP handling only. Parses request, calls service, returns response.
5. **Page / Component** (`src/app/`, `src/components/`) — UI rendering. Server Components fetch data directly with Drizzle. Client Components call API routes.

Never put database queries in API routes. Never put business logic in repositories.

## Database schema

There are exactly 5 tables. Do not create additional tables unless explicitly asked.

### clients

- id: text PK (cuid2)
- name: text NOT NULL
- email: text UNIQUE NOT NULL
- phone: text
- ndis_number: varchar(20)
- address: text
- suburb: varchar(100)
- weekday_code: text (NDIS support item code for Mon-Fri sessions)
- saturday_code: text (NDIS support item code for Saturday sessions)
- sunday_code: text (NDIS support item code for Sunday sessions)
- created_at: timestamp DEFAULT now()
- updated_at: timestamp
- deleted_at: timestamp (soft delete)

### appointments

- id: text PK (cuid2)
- client_id: text FK → clients.id CASCADE
- title: text
- starts_at: timestamp NOT NULL
- ends_at: timestamp NOT NULL
- status: enum('confirmed', 'completed', 'cancelled') DEFAULT 'confirmed'
- notes: text (session notes, written by admin after completion)
- invoiced: boolean DEFAULT false
- invoice_ref: text (invoice number, set when invoiced)
- created_at: timestamp DEFAULT now()
- updated_at: timestamp
- deleted_at: timestamp (soft delete)

### invoices

- id: text PK (gen_random_uuid)
- invoice_number: varchar(50) UNIQUE NOT NULL (format: INV-001, INV-002)
- client_id: text FK → clients.id CASCADE
- invoice_date: timestamp DEFAULT now()
- due_date: timestamp NOT NULL
- total: numeric(10,2) DEFAULT 0 (in cents)
- status: varchar(20) DEFAULT 'draft' (draft | issued | paid | cancelled)
- notes: text
- issued_at: timestamp
- paid_at: timestamp
- created_at: timestamp DEFAULT now()
- updated_at: timestamp
- deleted_at: timestamp (soft delete)

### invoice_items

- id: text PK (gen_random_uuid)
- invoice_id: text FK → invoices.id CASCADE
- appointment_id: text FK → appointments.id SET NULL (nullable)
- description: text NOT NULL
- quantity: numeric(10,2) NOT NULL (hours)
- unit_price: numeric(10,2) NOT NULL (rate per hour in cents)
- ndis_item_code: varchar(20)
- created_at: timestamp DEFAULT now()

### ndis_pricing (reference table, seeded, read-only)

- id: text PK (gen_random_uuid)
- support_item_code: varchar(20) UNIQUE NOT NULL
- support_item_name: varchar(255) NOT NULL
- unit: varchar(50) DEFAULT 'hour'
- national_price: numeric(10,2) NOT NULL (in cents)
- created_at: timestamp DEFAULT now()

## File structure

src/
app/
(admin)/
admin/
page.tsx — Dashboard
clients/
page.tsx — Client list + add
appointments/
page.tsx — Weekly schedule calendar
invoices/
page.tsx — Invoice list
generate/
page.tsx — Invoice generation from completed sessions
layout.tsx — Admin shell with sidebar
api/
appointments/
route.ts — GET (list), POST (create)
[id]/
route.ts — GET, PUT, DELETE
complete/
route.ts — POST (mark complete + save notes)
uninvoiced/
route.ts — GET (completed, not invoiced, for invoice generation)
clients/
route.ts — GET (list), POST (create)
[id]/
route.ts — GET, PUT, DELETE
invoices/
route.ts — GET (list with filters)
generate/
route.ts — POST (generate invoice from appointment IDs)
[id]/
route.ts — GET (invoice with items)
issue/
route.ts — POST (mark as issued)
mark-paid/
route.ts — POST (mark as paid)
cancel/
route.ts — POST (cancel invoice)
pdf/
route.tsx — GET (render + return PDF)
ndis-pricing/
route.ts — GET (list pricing items)
(auth)/
page.tsx — Login page
layout.tsx
layout.tsx — Root layout
globals.css
components/
ui/ — shadcn/ui components
shared/ — Reusable app components (status badges, empty states, stats cards)
db/
schema/ — Drizzle table definitions
index.ts — DB connection
lib/
auth.ts — getAuthenticatedUser(), requireAdmin()
errors.ts — Custom error classes
responses.ts — ApiResponse helper (success, error, created)
format.ts — formatCurrency(), formatDate(), etc.
utils.ts — cn() and other utilities
supabase/
client.ts — Browser Supabase client
server.ts — Server Supabase client
middleware.ts
repositories/ — One per table
services/ — Business logic
types/ — Shared TypeScript types
middleware.ts — Supabase auth middleware

## API response format

All API routes return this consistent format:

```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: { message: string, code?: string, details?: any } }
```

Use the ApiResponse helper:

- ApiResponse.success(data, message?)
- ApiResponse.created(data, message?)
- ApiResponse.error(message, status)
- ApiResponse.unknownError(error)

## UI guidelines

- Use the botanical/earthy design aesthetic from shadcn/ui with warm neutral tones
- Every page needs an empty state with icon, title, description, and action button
- Status badges: confirmed = blue, completed = green, cancelled = red/muted, draft = gray, issued = amber, paid = green
- Tables use shadcn DataTable with search and pagination
- Forms use shadcn form components with proper labels and validation messages
- Loading states: skeleton loaders on data fetches
- All monetary values: display as "$XX.XX" (divide cents by 100)
- All dates: display in Australian format (DD/MM/YYYY or "Mon, 15 Mar 2026")
- Sidebar navigation: Dashboard, Schedule, Clients, Invoices (4 items only)

## CRITICAL RULES — read these before every response

1. **DO NOT add features not explicitly requested.** No session timers, no pause/resume, no audit logs, no client portal, no Google Calendar sync, no travel estimation, no recurring bookings, no Redis, no rate limiting, no Sentry. If it's not in the task, don't build it.

2. **DO NOT refactor working code.** If existing code works and the task doesn't ask you to change it, leave it alone.

3. **DO NOT create additional database tables** beyond the 5 listed above.

4. **DO NOT add columns to tables** beyond what's specified in the schema above.

5. **DO NOT over-engineer.** This is a tool for ONE person. No race condition handling beyond basic overlap checks. No idempotency keys. No advisory locks. No caching layer. Simple queries, simple logic.

6. **DO NOT split code across more files than necessary.** If a service has 3 methods, it's one file, not three.

7. **Keep responses focused.** Only output the files relevant to the current task. Don't regenerate files that haven't changed.

8. **Match existing patterns.** If you can see how the clients API is structured, build the appointments API the same way. Consistency matters more than cleverness.

9. **Use Server Components by default.** Only add 'use client' when you need interactivity (forms, buttons with onClick, state). Data fetching pages should be async Server Components that query Drizzle directly.

10. **Australian English** in all user-facing text (e.g., "colour" not "color" in UI copy, but American spelling in code since that's the convention).
