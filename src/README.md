# KQ System Admin Dashboard

A comprehensive admin dashboard for managing clients, appointments, and invoices with NDIS pricing integration and error monitoring via Sentry.

## Overview

This project is a Next.js application with TypeScript and Supabase for the backend. It provides a full-featured admin interface for managing appointments, clients, and invoicing with support for NDIS pricing codes. Includes comprehensive error monitoring and performance tracking via Sentry.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Supabase Auth
- **PDF Generation**: React-PDF
- **Error Monitoring**: Sentry
- **ORM**: Drizzle ORM

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (admin)/           # Admin dashboard routes
│   │   ├── appointments/  # Appointment management
│   │   ├── clients/        # Client management
│   │   ├── invoices/       # Invoice generation & management
│   │   └── dashboard/      # Admin dashboard
│   ├── (auth)/             # Authentication routes
│   └── api/                # API routes
├── components/            # Reusable components
│   ├── botanical/          # Custom design system components
│   ├── pdf/                # PDF generation components
│   ├── sentry/             # Sentry error boundary components
│   ├── shared/             # Shared components
│   └── ui/                 # Shadcn/ui components
├── db/                     # Database schema
│   └── schema/             # Supabase table schemas
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
│   ├── supabase/           # Supabase client setup
│   ├── sentry.ts           # Sentry error tracking utilities
├── repositories/           # Data access layer
├── services/               # Business logic layer
├── sentry.*.config.ts      # Sentry configuration files
└── styles/                 # Global styles
```

## Features

- **Client Management**: Add, edit, and manage client information with rate code status tracking
- **Appointment Scheduling**: Calendar-based appointment management with completion tracking
- **Invoice Generation**: Automated invoice creation with PDF export
- **NDIS Pricing**: Integrated NDIS pricing codes and calculations
- **Dashboard**: Real-time statistics and recent activity overview
- **Authentication**: Secure login with Supabase auth
- **Error Monitoring**: Comprehensive error tracking with Sentry for both client and server

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project with the required tables set up
- A Sentry project (optional, for error monitoring)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd 201_KQ_SYSTEM
```

2. Install dependencies:
```bash
npm install
```

3. Install Sentry SDK:
```bash
npx @sentry/wizard@latest -i nextjs
```
This will:
- Install `@sentry/nextjs`
- Create the Sentry configuration files (already included in this project)
- Add necessary scripts to `package.json`

4. Set up environment variables:

   This project uses two environment files for better security:

   **Non-secret configuration** (`.env`):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

   **Secrets** (`.env.local`):
   ```bash
   cp .env.example.secrets .env.local
   ```
   Edit `.env.local` with your sensitive values (API keys, DSNs, etc.).

   > ⚠️ **Important**: Never commit `.env.local` to version control! It's excluded by `.gitignore`.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

### Non-Secret Configuration (`.env.example`)

These values are safe to commit and contain general application configuration:

| Variable | Description | Example |
|-----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `ADMIN_EMAIL` | Admin user email | `admin@example.com` |
| `NEXT_PUBLIC_BUSINESS_NAME` | Business name for PDFs | `KQ Collective` |
| `NEXT_PUBLIC_BUSINESS_ABN` | Business ABN | `00 000 000 000` |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Business contact email | `contact@kqcollective.com.au` |
| `NEXT_PUBLIC_BUSINESS_ADDRESS` | Business address | `123 Main St, Sydney` |
| `NEXT_PUBLIC_BUSINESS_BANK_NAME` | Bank name | `Westpac` |
| `NEXT_PUBLIC_BUSINESS_BSB` | Bank BSB | `033-000` |
| `NEXT_PUBLIC_BUSINESS_ACCOUNT_NUMBER` | Bank account | `12345678` |
| `NEXT_PUBLIC_BUSINESS_ACCOUNT_NAME` | Account name | `KQ Collective` |
| `NEXT_PUBLIC_NDIS_REGISTRATION_NUMBER` | NDIS provider number | `12345678` |
| `NEXT_PUBLIC_TRAVEL_RATE` | Travel rate per km (AUD) | `0.97` |
| `SENTRY_ENVIRONMENT` | Environment name | `development` |
| `SENTRY_RELEASE` | Release version | `1.0.0` |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | `http://localhost:3000` |

### Secret Configuration (`.env.example.secrets`)

These values contain sensitive information and should NEVER be committed:

| Variable | Description | Source |
|-----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Project Settings → API |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry client DSN | Sentry Project Settings → Client Keys |
| `SENTRY_DSN` | Sentry server DSN | Sentry Project Settings → Client Keys |
| `DATABASE_URL` | PostgreSQL connection string | Supabase Project Settings → Database |

**Vercel / serverless:** Set `DATABASE_URL` to the **Transaction pooler** connection string (Supabase → Database → *Connection string* → **Transaction** mode, port **6543**, includes `pgbouncer=true`). Using the direct connection (port 5432) often causes **500 errors** on Vercel (timeouts, connection limits, IPv6).

> 🔐 **Security Note**: The `.env.example.secrets` file is excluded from version control by `.gitignore`.

## Sentry Error Monitoring

This application includes comprehensive Sentry integration for error monitoring and performance tracking.

### Setup Sentry

1. Create a Sentry project at [sentry.io](https://sentry.io)
2. Add your DSN to `.env.local`:
   - `NEXT_PUBLIC_SENTRY_DSN` - For client-side error tracking
   - `SENTRY_DSN` - For server-side error tracking (can use the same value)
3. Set the environment in `.env`:
   - `SENTRY_ENVIRONMENT` - `development`, `staging`, or `production`
4. (Optional) Set a release for version tracking in `.env`:
   - `SENTRY_RELEASE` - e.g., `1.0.0`, `v1.2.3`, or your git commit hash

### What Gets Monitored

**Server-Side:**
- Unhandled API errors (all routes automatically captured)
- Custom errors from services (ValidationError, NotFoundError, etc.)
- Database query errors
- Authentication failures
- Invoice generation performance
- API route response times

**Client-Side:**
- React component errors (via Error Boundary)
- Fetch request failures
- Unhandled JavaScript errors
- User session context (user ID, email)
- Page load performance

**Performance Monitoring:**
- API route transaction times
- Database query performance
- Dashboard data aggregation
- Client-side page transitions
- Invoice generation performance

### Using Sentry Utilities

The project includes a centralized Sentry utility in `lib/sentry.ts`:

```typescript
import { captureException, captureApiError, trackInvoiceGeneration } from '@/lib/sentry';

// Capture an exception with context
captureException(error, {
  tags: { module: 'invoices' },
  extra: { invoiceId: 'INV-001' },
  level: 'error',
});

// Capture API errors with request context
captureApiError(error, {
  method: 'POST',
  path: '/api/invoices/generate',
  query: { client_id: '123' },
  body: { /* ... */ },
  userId: 'user-123',
});

// Track invoice generation
trackInvoiceGeneration({
  invoiceNumber: '2024-001',
  clientId: 'client-123',
  sessionCount: 5,
  totalAmount: 50000,
  userId: 'user-123',
});
```

### Error Boundary

The admin layout is wrapped with a `SentryErrorBoundary` that catches React errors and displays a user-friendly fallback UI. The boundary automatically:

- Captures the error in Sentry with component stack trace
- Displays an error message to the user
- Provides an error ID for support reference
- Offers retry/reload options

## Database Setup

The database schema is located in `src/db/schema/`. Make sure to run the migrations in your Supabase project to set up the required tables:
- `appointments` - Appointment records
- `clients` - Client information
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items
- `ndis_pricing` - NDIS pricing reference data

### Database Health Check

The application includes database health checks via `lib/db-utils.ts`:

```typescript
import { checkDatabaseHealth, ensureInvoiceNumberSequence } from '@/lib/db-utils';

// Check database health
const health = await checkDatabaseHealth();
console.log(health.issues);

// Ensure invoice number sequence exists
await ensureInvoiceNumberSequence(1);
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sentry-upload-sourcemaps` - Upload source maps to Sentry (when using Sentry)

## Error Handling Patterns

### API Routes

```typescript
import { ApiResponse } from '@/lib/responses';
import { captureException } from '@/lib/sentry';

export async function GET() {
  try {
    // Your logic here
    return ApiResponse.success(data);
  } catch (error) {
    // Automatically captured in Sentry
    return ApiResponse.unknownError(error, 'context description');
  }
}
```

### Services

```typescript
import { NotFoundError, ValidationError } from '@/lib/errors';
import { captureException } from '@/lib/sentry';

async function someOperation() {
  try {
    // Business logic
  } catch (error) {
    // Capture with custom context
    captureException(error, {
      tags: { operation: 'invoice_generation' },
      extra: { invoiceId, clientId },
    });
    throw new ValidationError('Custom error message');
  }
}
```

### Client Components

```typescript
'use client';

import { captureException } from '@/lib/sentry';

async function fetchData() {
  try {
    const res = await fetch('/api/endpoint');
    if (!res.ok) throw new Error('Request failed');
    return await res.json();
  } catch (error) {
    // Capture client-side errors
    captureException(error, {
      tags: { component: 'Dashboard' },
      user: { id, email },
    });
    toast.error('Failed to load data');
  }
}
```

## Troubleshooting

### Sentry Not Capturing Errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly in `.env.local`
2. Check browser console for Sentry initialization errors
3. Ensure Sentry files are at the root of `src/`
4. Verify the environment matches your Sentry project settings

### Development Mode

In development mode:
- Errors are logged to the console with full details
- Sentry filters out validation errors (considered expected)
- Sample rates are set to 1.0 for comprehensive testing
- Detailed error responses are returned from API routes

### Production Mode

In production mode:
- Sample rates should be lower (e.g., 0.1) to manage quota
- Generic error messages are returned to users
- Full error details are sent to Sentry
- Source maps should be uploaded for better stack traces

## Security Best Practices

1. **Environment Files**:
   - Use `.env` for non-secret configuration
   - Use `.env.local` for sensitive secrets
   - Never commit `.env.local` to version control

2. **Secrets Management**:
   - Use `.env.example.secrets` as a template for secrets
   - Rotate API keys regularly
   - Use environment-specific values in production

3. **Git**:
   - `.env.example` is committed (safe, non-secret)
   - `.env.example.secrets` is excluded by `.gitignore`
   - `.env.local` is excluded by `.gitignore`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly, including error scenarios
4. Submit a pull request

## License

[Your License Here]
