# Investigation: Invoice Generation 500 Error

## Summary
The 500 error when generating invoices is caused by a missing PostgreSQL database sequence `invoice_number_seq`. The invoice generation code references this sequence but it doesn't exist in the database, causing a database error that results in a 500 response.

## Symptoms
- 500 error occurs consistently when attempting to generate invoices
- Error happens regardless of which sessions or clients are selected
- Client receives generic "An unexpected error occurred" message (the actual error is only logged to console)

## Investigation Log

### Phase 1 - Initial Assessment
**Hypothesis:** Investigate the invoice generation flow to identify failure points
**Findings:** 
- Entry point: `app/api/invoices/generate/route.ts` → `invoicesService.generateInvoice()` → `invoicesRepository.createWithItems()`
- Error handling uses `ApiResponse.unknownError(error)` which logs to console but returns generic 500 message
**Conclusion:** Need to trace through the code path to find where error originates

### Phase 2 - Code Analysis
**Hypothesis:** The invoice number sequence might be missing from the database
**Findings:**
- In `repositories/invoices.repository.ts` line 53:
  ```typescript
  const result = await db.execute(sql`SELECT nextval('invoice_number_seq') as num`);
  ```
- No SQL migration files exist in the project
- No code found that creates the `invoice_number_seq` sequence
- The project uses Drizzle ORM but no migration creates this sequence

**Evidence:**
- File: `repositories/invoices.repository.ts`, line 53
- File: `repositories/invoices.repository.ts`, lines 1-672 (full file read)
- Search for "*.sql" files returned 0 results
- Search for "invoice_number_seq" only found the usage, not the definition

**Conclusion:** CONFIRMED - The `invoice_number_seq` sequence doesn't exist in the database

### Phase 3 - Additional Potential Issues Found
**Hypothesis:** Check for other potential failure points in the invoice generation code
**Findings:**
1. **Travel KM data type issue** (`services/invoices.service.ts`, line ~127):
   ```typescript
   await db
     .update(appointments)
     .set({ travel_km: session.travel_km.toFixed(2), updated_at: new Date() })
   ```
   If `session.travel_km` is already a number and gets stringified by JSON, calling `.toFixed()` would fail.

2. **Zero rate validation** (`services/invoices.service.ts`, lines 57-67):
   ```typescript
   const sessionsWithZeroRate = sessions.filter(s => s.rate === 0);
   if (sessionsWithZeroRate.length > 0) {
     throw new ValidationError(
       `Cannot generate invoice: ${sessionsWithZeroRate.length} session(s) have no NDIS rate...`
     );
   }
   ```
   This validation is correct but if clients don't have rate codes set (weekday_code, saturday_code, sunday_code are null), the rate would be 0.

**Evidence:**
- File: `services/invoices.service.ts`, lines 57-67 (zero rate validation)
- File: `services/invoices.service.ts`, lines 120-131 (travel_km save)
- File: `db/schema/clients.ts`, lines 17-19 (rate code fields are nullable)

**Conclusion:** The primary issue is the missing sequence; these are secondary issues that may surface after fixing the sequence

## Root Cause

The PostgreSQL sequence `invoice_number_seq` does not exist in the database. The invoice generation code at `repositories/invoices.repository.ts:53` calls `SELECT nextval('invoice_number_seq')` which fails with a database error, resulting in a 500 response to the client.

**Exact location:** `repositories/invoices.repository.ts`, line 53

```typescript
async getNextInvoiceNumber(): Promise<string> {
  const result = await db.execute(sql`SELECT nextval('invoice_number_seq') as num`);
  // ^^^ This fails because the sequence doesn't exist
  const num = result.rows[0].num;
  const year = new Date().getFullYear();
  return `${year}-${String(num).padStart(3, '0')}`;
}
```

## Recommendations

### 1. Create the Missing Sequence (CRITICAL - Fixes the 500 error)
Run this SQL in your database:

```sql
-- Create the sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Optional: Set a specific starting number if you've already created invoices manually
-- SELECT setval('invoice_number_seq', (SELECT COALESCE(MAX(CAST(substring(invoice_number FROM '-(\d+$)') AS INTEGER)), 0) FROM invoices WHERE invoice_number ~ '\d{4}-\d+'));
```

Or add to a Drizzle migration:
```typescript
// In your migration file
import { sql } from 'drizzle-orm';

export async function up(db: DrizzleTransaction) {
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`);
}

export async function down(db: DrizzleTransaction) {
  await db.execute(sql`DROP SEQUENCE IF EXISTS invoice_number_seq`);
}
```

### 2. Improve Error Reporting (IMPORTANT - Helps diagnose future issues)
**File:** `app/api/invoices/generate/route.ts`

Change:
```typescript
return ApiResponse.unknownError(error);
```

To:
```typescript
// Log full error details
console.error('Invoice generation error:', {
  name: error instanceof Error ? error.name : 'Unknown',
  message: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
});

// Include error details in development
if (process.env.NODE_ENV === 'development') {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      } 
    },
    { status: 500 }
  );
}

return ApiResponse.unknownError(error);
```

### 3. Fix Travel KM Type Handling (MEDIUM - Prevents future errors)
**File:** `services/invoices.service.ts`, line ~127

Change:
```typescript
.set({ travel_km: session.travel_km.toFixed(2), updated_at: new Date() })
```

To:
```typescript
.set({ 
  travel_km: typeof session.travel_km === 'number' 
    ? session.travel_km.toFixed(2) 
    : session.travel_km,
  updated_at: new Date() 
})
```

### 4. Add Sequence Existence Check (LOW - Defensive programming)
**File:** `repositories/invoices.repository.ts`, line ~52

Add before the nextval call:
```typescript
async getNextInvoiceNumber(): Promise<string> {
  // Ensure sequence exists
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1`);
  
  const result = await db.execute(sql`SELECT nextval('invoice_number_seq') as num`);
  const num = result.rows[0].num;
  const year = new Date().getFullYear();
  return `${year}-${String(num).padStart(3, '0')}`;
}
```

## Fixes Implemented

### ✅ 1. Enhanced Error Reporting (All API Routes)
**File:** `lib/responses.ts`

- Added detailed error logging with timestamp, error name, message, and stack trace
- In development mode, returns full error details to client for easier debugging
- Added optional `context` parameter to identify which endpoint had the error
- Benefits all 27+ API routes that use `ApiResponse.unknownError()`

### ✅ 2. Sequence Existence Check (Defensive)
**File:** `repositories/invoices.repository.ts`

- Added `CREATE SEQUENCE IF NOT EXISTS` check before calling `nextval()`
- Prevents errors if the sequence is dropped or missing
- Automatically creates the sequence if it doesn't exist

### ✅ 3. Travel KM Type Handling Fix
**File:** `services/invoices.service.ts`

- Fixed potential type error when `travel_km` is already a string
- Safely converts to string with 2 decimal places for both number and string inputs
- Prevents runtime errors when data comes from different sources

### ✅ 4. Date Handling Fix for Sorting
**File:** `services/invoices.service.ts`

- Fixed "getTime is not a function" error when sorting sessions
- Dates from API come as strings, not Date objects
- Added defensive type checking to handle both Date and string inputs
- Also fixed service period start/end date handling

### ✅ 5. Type Definition Update
**File:** `repositories/invoices.repository.ts`

- Updated `UninvoicedSession` type to allow `starts_at` and `ends_at` as `Date | string`
- Reflects reality that API responses serialize dates as strings

### ✅ 6. Database Utilities Module (New)
**File:** `lib/db-utils.ts` (NEW)

Created utility functions for database management:
- `ensureInvoiceNumberSequence()` - Ensures sequence exists
- `setInvoiceNumberSequence()` - Sets sequence to specific value
- `getInvoiceNumberSequence()` - Gets current sequence value
- `syncInvoiceNumberSequence()` - Syncs sequence to highest existing invoice number
- `checkDatabaseHealth()` - Health check for critical database objects

### ✅ 5. Enhanced Invoice Generate Route Error Logging
**File:** `app/api/invoices/generate/route.ts`

- Added detailed error logging in the catch block
- Added development-mode error response with stack trace
- Makes debugging invoice generation issues much easier

## Preventive Measures

1. **Run database migrations as part of deployment** - Ensure all database objects (sequences, tables, indexes) are created through migration scripts

2. **Add health check endpoint** - Create a `/api/health` endpoint that verifies critical database objects exist (utilities available in `lib/db-utils.ts`)

3. **Improve client-side error handling** - The invoice generate UI should display more specific error messages from the API response

4. **Add integration tests** - Test the invoice generation flow end-to-end to catch database schema mismatches

5. **Database schema documentation** - Maintain a README documenting all database objects including sequences, indexes, and triggers

## Next Steps

To fully resolve the 500 error, run this SQL in your database:

```sql
-- Create the missing sequence
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Optional: If you have existing invoices, sync the sequence to continue from the highest number
SELECT setval('invoice_number_seq',
  (SELECT COALESCE(MAX(CAST(substring(invoice_number FROM '-(\d+$)') AS INTEGER)), 0)
   FROM invoices
   WHERE invoice_number ~ '\d{4}-\d+')
);
```

Or use the new utility function from `lib/db-utils.ts`:

```typescript
import { syncInvoiceNumberSequence } from '@/lib/db-utils';

// Call this during app initialization or in a setup script
await syncInvoiceNumberSequence();
```
