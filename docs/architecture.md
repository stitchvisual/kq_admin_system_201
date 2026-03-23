# KQ Portal System Architecture

## Executive Summary

KQ Portal is a Next.js 15 application designed for NDIS (National Disability Insurance Scheme) service providers to manage clients, appointments, and invoicing. The system follows a layered architecture pattern with clear separation between presentation, business logic, and data access concerns.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4 with custom botanical design system
- **UI Components**: Radix UI primitives with custom theming
- **Calendar**: FullCalendar for appointment scheduling
- **Animations**: Framer Motion for micro-interactions

### Backend
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe queries
- **Authentication**: Supabase Auth with SSR support
- **Email**: Resend API for invoice delivery
- **PDF Generation**: @react-pdf/renderer for invoice documents

### Infrastructure
- **Error Monitoring**: Sentry with edge/server/client configurations
- **Hosting**: Vercel-compatible serverless deployment

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (React Components, Server components)      │
├─────────────────────────────────────────────┤
│           API Routes Layer                  │
│  (/app/api/* - Next.js route handlers)      │
├─────────────────────────────────────────────┤
│           Service Layer                     │
│  (Business logic, validation, orchestration)│
├─────────────────────────────────────────────┤
│           Repository Layer                  │
│  (Data access, query building)              │
├─────────────────────────────────────────────┤
│           Database Layer                    │
│  (PostgreSQL/Neon, Drizzle ORM)             │
└─────────────────────────────────────────────┘
```

### Route Structure

The application uses Next.js route groups for logical separation:

- **`(admin)/admin`**: Authenticated admin portal (dashboard, appointments, clients, invoices)
- **`(auth)`**: Authentication flows
- **`api/`**: RESTful API endpoints for CRUD operations

---

## Data Architecture

### Core Entities

| Entity | Purpose | Key relationships |
|--------|---------|-------------------|
| **clients** | NDIS participant records | Has many appointments, invoices |
| **appointments** | Scheduled sessions (solo/group) | Belongs to client, has participants |
| **appointment_participants** | Group session junction | Links appointments to clients |
| **invoices** | Billing documents | belongs to client, has items |
| **invoice_items** | Invoice line items | belongs to invoice, links to appointment |
| **ndis_pricing** | NDIS rate lookup table | Reference data |

### Group Appointment Model
The system supports both solo and group appointments through a junction table pattern:
- **Solo appointments**: Direct `client_id` reference
- **Group appointments**: Multiple `appointment_participants` with split-rate calculations
- **Composite IDs** (e.g., `apptId-clientId`) enable per-participant invoicing

### Soft Delete pattern
All entities implement soft deletes via `deleted_at` timestamp, preserving data integrity for audit trails and invoice references.

---

## Business Logic

### Invoice Generation Flow
1. **Session Selection**: Query uninvoiced completed appointments by date range
2. **Rate resolution**: NDIS rates resolved via appointment override → client day-specific codes → pricing table
3. **Group split calculation**: Hourly rate divided equally among participants
4. **Line item creation**: Support items + travel charges
5. **Transaction**: Atomic creation of invoice, items, and appointment flags

### State Machine (Invoice status)
```
draft → issued → paid
  ↓        ↓
cancelled ← cancelled
```

---

## Security Architecture

### Authentication
- **Supabase Auth** manages sessions via HTTP-only cookies
- Server-side session validation in middleware
- Single admin enforcement via `ADMIN_email` environment variable

### Authorization pattern
```typescript
// API routes require admin authentication
const user = await requireAdmin();
```

### Error handling
- Custom error classes (`NotFoundError`, `ValidationError`, `UnauthorizedError`)
- Sentry integration with user context tracking
- Error boundaries with React component failures
---

## Component Architecture

### Design System
The **Botanical** design system (`src/styles/botanical.ts`) provides semantic tokens for colors, shadows, typography, and spacing, creating a cohesive visual identity.

- **Colors**: Primary, surface, and semantic palette
- **Typography**: Heading and body font families
- **spacing**: 8pt grid system
- **shadows**: Elevation levels

### Component Patterns
- **Server components**: Default for data fetching (pages, layouts)
- **Client components**: Interactive elements marked with `'use client'` hook
- **Compound components**: Panel-based UIs (ClientFormPanel, ClientDetailPanel, InvoiceDetailPanel)
- **Shared components**: StatCard, PageHeader, DataTable
- **PDF components**: InvoicePDF for A4 invoice generation with react-pdf
 rendering
- **UI primitives**: Radix UI-based components (button, dialog, select, checkbox, avatar, alert-dialog)

 styled with Tailwind variants
- **Layout components**: AdminLayout with responsive sidebar navigation

- **Calendar components**: ScheduleCalendar integrating FullCalendar with custom botanical theming
- **Invoice components**: SessionSelectionBar, GenerateDateRangeSelector, InvoiceRow, InvoiceStatusBadge
- **Dashboard components**: AttentionList, TodaySchedule for home page widgets
- **Form components**: ClientFormPanel for client CRUD operations
- **Empty state**: EmptyState for consistent no-data UI states

- **Motion utilities**: Animation variants from Framer Motion
- **Theme support**: ThemeProvider for dark/light mode switching
- **Toast notifications**: Sonner for toast notifications
- **Data table**: DataTable with sorting, filtering, and pagination
- **Status badges**: InvoiceStatusBadge for visual invoice status indicators
- **avatar**: ClientAvatar for client profile images
- **sidebar navigation**: AdminSidebarNav for responsive sidebar
- **panel**: Panel for reusable modal/panel containers

- **error boundary**: SentryErrorBoundary for graceful error handling
- **shared components**: Re-usable UI components (Page header, section label, stat card)