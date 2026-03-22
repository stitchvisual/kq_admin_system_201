# Resend Invoice Email Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email sending for invoices via Resend, allowing admins to email issued invoices (with PDF attachment) to clients directly from the invoice detail panel.

**Architecture:** A dedicated Resend client wrapper in `lib/`, an API route for sending invoice emails, and an HTML email template. Reuse existing PDF generation logic by extracting it into a shared function. UI: "Send Email" button in InvoiceDetailPanel for issued invoices.

**Tech Stack:** Next.js App Router, Resend SDK, @react-pdf/renderer (existing), Node.js runtime for PDF + email

---

## Prerequisites (Human Tasks)

- [ ] Create Resend account at [resend.com](https://resend.com)
- [ ] Generate API key at [resend.com/api-keys](https://resend.com/api-keys)
- [ ] Verify sending domain at [resend.com/domains](https://resend.com/domains) (for production; `onboarding@resend.dev` works for testing)
- [ ] Add `RESEND_API_KEY` to `.env.local`

---

## File Structure (Create/Modify Map)

### New Files

| Path | Responsibility |
|------|----------------|
| `src/lib/resend.ts` | Resend client singleton, typed send wrapper |
| `src/lib/invoice-pdf.ts` | Extract PDF buffer generation (used by PDF route + email) |
| `src/app/api/invoices/[id]/send-email/route.ts` | POST handler: fetch invoice, generate PDF, send email |
| `src/emails/invoice-email.ts` | HTML email template builder for invoice notification |

### Modified Files

| Path | Changes |
|------|---------|
| `src/app/api/invoices/[id]/pdf/route.tsx` | Use shared `generateInvoicePdfBuffer()` from lib |
| `src/components/invoices/InvoiceDetailPanel.tsx` | Add `onSendEmail` prop, "Send Email" button (issued only) |
| `src/app/(admin)/admin/invoices/page.tsx` | Wire `handleSendEmail`, pass to InvoiceDetailPanel |
| `.env.local.example` | Add RESEND_API_KEY, RESEND_FROM_EMAIL |

---

## Execution Order

1. **Task 1:** Extract PDF buffer generation to shared lib
2. **Task 2:** Create Resend client and email service
3. **Task 3:** Create invoice email template
4. **Task 4:** Create send-email API route
5. **Task 5:** Add Send Email UI to InvoiceDetailPanel and page

---

## Task 1: Extract PDF Buffer Generation

**Files:**
- Create: `src/lib/invoice-pdf.ts`
- Modify: `src/app/api/invoices/[id]/pdf/route.tsx`

- [ ] **Step 1.1: Create `src/lib/invoice-pdf.ts`**

```typescript
// src/lib/invoice-pdf.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';

/**
 * Generate invoice PDF as Buffer. Used by PDF download route and email sending.
 * Must run in Node.js runtime (@react-pdf/renderer).
 */
export async function generateInvoicePdfBuffer(invoice: InvoiceWithClient): Promise<Buffer> {
  const plainInvoice = JSON.parse(JSON.stringify(invoice)) as typeof invoice;
  const buffer = await renderToBuffer(<InvoicePDF invoice={plainInvoice} />);
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}
```

- [ ] **Step 1.2: Modify PDF route to use shared function**

In `src/app/api/invoices/[id]/pdf/route.tsx`:

Replace the inline PDF generation with:

```typescript
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';

// ... inside GET handler, after getById:
const buffer = await generateInvoicePdfBuffer(invoice);
```

Remove the `renderToBuffer` and `InvoicePDF` imports from the route. Keep the rest of the route (headers, Response, error handling) unchanged.

- [ ] **Step 1.3: Verify PDF route still works**

Run dev server, open an invoice, click Download. Confirm PDF downloads correctly.

- [ ] **Step 1.4: Commit**

```bash
git add src/lib/invoice-pdf.ts src/app/api/invoices/[id]/pdf/route.tsx
git commit -m "refactor: extract invoice PDF buffer generation to shared lib"
```

---

## Task 2: Create Resend Client and Config

**Files:**
- Create: `src/lib/resend.ts`
- Modify: `.env.local.example`

- [ ] **Step 2.1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2.2: Create `src/lib/resend.ts`**

```typescript
// src/lib/resend.ts
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const resend = apiKey ? new Resend(apiKey) : null;

export function isResendConfigured(): boolean {
  return Boolean(apiKey);
}

export function getFromAddress(): string {
  // Production: use verified domain. Dev: onboarding@resend.dev
  return fromEmail.includes('@') 
    ? `${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'KQ Collective'} <${fromEmail}>`
    : 'KQ Collective <onboarding@resend.dev>';
}
```

- [ ] **Step 2.3: Update `.env.local.example`**

Add:

```
# Resend (Optional - for invoice email sending)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=invoices@yourdomain.com
```

- [ ] **Step 2.4: Commit**

```bash
git add src/lib/resend.ts package.json package-lock.json .env.local.example
git commit -m "feat: add Resend client and env config"
```

---

## Task 3: Create Invoice Email Template

**Files:**
- Create: `src/emails/invoice-email.tsx`

- [ ] **Step 3.1: Create `src/emails/invoice-email.tsx`**

```typescript
// src/emails/invoice-email.tsx
interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
}

export function InvoiceEmail({ clientName, invoiceNumber, total, dueDate }: InvoiceEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '20px', color: '#1a1a1a' }}>Invoice {invoiceNumber}</h1>
      <p style={{ fontSize: '16px', color: '#4a4a4a' }}>Hi {clientName},</p>
      <p style={{ fontSize: '16px', color: '#4a4a4a' }}>
        Please find your invoice attached. The total amount of <strong>{total}</strong> is due by {dueDate}.
      </p>
      <p style={{ fontSize: '14px', color: '#6a6a6a' }}>
        If you have any questions, please don't hesitate to contact us.
      </p>
    </div>
  );
}
```

This is a simple HTML-compatible structure. Resend accepts `html` string or `react` component. For maximum compatibility and to avoid React Email dependency, we'll use an HTML string in the API route built from template variables. Adjust: create a function that returns HTML string instead.

- [ ] **Step 3.2: Replace with HTML string builder (simpler, no extra deps)**

```typescript
// src/emails/invoice-email.ts
export function buildInvoiceEmailHtml(params: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
}): string {
  const { clientName, invoiceNumber, total, dueDate } = params;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 20px; color: #1a1a1a;">Invoice ${invoiceNumber}</h1>
  <p style="font-size: 16px; color: #4a4a4a;">Hi ${clientName},</p>
  <p style="font-size: 16px; color: #4a4a4a;">
    Please find your invoice attached. The total amount of <strong>${total}</strong> is due by ${dueDate}.
  </p>
  <p style="font-size: 14px; color: #6a6a6a;">
    If you have any questions, please don't hesitate to contact us.
  </p>
</body>
</html>
  `.trim();
}
```

Save as `src/emails/invoice-email.ts` (not tsx).

- [ ] **Step 3.3: Commit**

```bash
git add src/emails/invoice-email.ts
git commit -m "feat: add invoice email HTML template"
```

---

## Task 4: Create Send-Email API Route

**Files:**
- Create: `src/app/api/invoices/[id]/send-email/route.ts`

- [ ] **Step 4.1: Create route file**

```typescript
// src/app/api/invoices/[id]/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';
import { resend, isResendConfigured, getFromAddress } from '@/lib/resend';
import { generateInvoicePdfBuffer } from '@/lib/invoice-pdf';
import { buildInvoiceEmailHtml } from '@/emails/invoice-email';

export const runtime = 'nodejs';

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    if (!isResendConfigured() || !resend) {
      return ApiResponse.error('Email sending is not configured. Set RESEND_API_KEY.', 503);
    }

    const { id } = await params;
    const invoice = await invoicesService.getById(id);

    if (invoice.status !== 'issued') {
      return ApiResponse.error('Only issued invoices can be emailed.', 400, 'VALIDATION_ERROR');
    }

    const clientEmail = invoice.client?.email;
    if (!clientEmail) {
      return ApiResponse.error('Client has no email address.', 400, 'VALIDATION_ERROR');
    }

    const buffer = await generateInvoicePdfBuffer(invoice);
    const filename = `${invoice.invoice_number}.pdf`;

    const html = buildInvoiceEmailHtml({
      clientName: invoice.client.name,
      invoiceNumber: invoice.invoice_number,
      total: formatCurrency(invoice.total),
      dueDate: formatDate(invoice.due_date),
    });

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [clientEmail],
      subject: `Invoice ${invoice.invoice_number} from ${process.env.NEXT_PUBLIC_BUSINESS_NAME || 'KQ Collective'}`,
      html,
      attachments: [
        {
          filename,
          content: buffer,
        },
      ],
      idempotencyKey: `invoice-email/${id}/${Date.now()}`,
    });

    if (error) {
      console.error('[Send Invoice Email] Resend error:', error);
      return ApiResponse.error(error.message, 500);
    }

    return ApiResponse.success({ id: data?.id, message: 'Invoice emailed successfully' });
  } catch (err) {
    if (err instanceof Error && err.name === 'NotFoundError') {
      return ApiResponse.error(err.message, 404);
    }
    if (err instanceof Error && err.name === 'UnauthorizedError') {
      return ApiResponse.error(err.message, 401);
    }
    console.error('[Send Invoice Email] Error:', err);
    return ApiResponse.unknownError(err);
  }
}
```

- [ ] **Step 4.2: Verify ApiResponse usage**

Check `src/lib/responses.ts` for `ApiResponse.success` and `ApiResponse.error` signatures. Adjust if needed.

- [ ] **Step 4.3: Test with curl (optional)**

```bash
curl -X POST http://localhost:3000/api/invoices/<INVOICE_ID>/send-email \
  -H "Cookie: <session_cookie>" \
  -H "Content-Type: application/json"
```

- [ ] **Step 4.4: Commit**

```bash
git add src/app/api/invoices/[id]/send-email/route.ts
git commit -m "feat: add send-email API route for invoices"
```

---

## Task 5: Add Send Email UI

**Files:**
- Modify: `src/components/invoices/InvoiceDetailPanel.tsx`
- Modify: `src/app/(admin)/admin/invoices/page.tsx`

- [ ] **Step 5.1: Update InvoiceDetailPanel props and ActionButtons**

In `src/components/invoices/InvoiceDetailPanel.tsx`:

Add to interface:
```typescript
onSendEmail?: () => void;
emailLoading?: boolean;
```

Add to ActionButtons props and render a "Send Email" button when `status === 'issued'`:

```tsx
{status === 'issued' && onSendEmail && (
  <SecondaryBtn
    type="button"
    onClick={onSendEmail}
    disabled={emailLoading}
  >
    {emailLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
    Send Email
  </SecondaryBtn>
)}
```

Import `Mail` from `lucide-react`.

- [ ] **Step 5.2: Wire handler in invoices page**

In `src/app/(admin)/admin/invoices/page.tsx`:

Add state: `const [emailLoading, setEmailLoading] = useState<string | null>(null);`

Add handler:

```typescript
const handleSendEmail = async (invoiceId: string) => {
  setEmailLoading(invoiceId);
  try {
    const res = await fetch(`/api/invoices/${invoiceId}/send-email`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      toast.success('Invoice emailed successfully');
    } else {
      toast.error(data.error?.message ?? 'Failed to send email');
    }
  } catch (err) {
    toast.error('Failed to send email');
  } finally {
    setEmailLoading(null);
  }
};
```

Pass to InvoiceDetailPanel:
```tsx
onSendEmail={selectedInvoice ? () => handleSendEmail(selectedInvoice.id) : undefined}
emailLoading={emailLoading === selectedInvoice?.id}
```

- [ ] **Step 5.3: Handle 503 (Resend not configured)**

If API returns 503, show toast: "Email sending is not configured." Consider hiding the Send Email button when Resend is not configured. That would require a small API endpoint or env check. For MVP, showing the button and surfacing the error is acceptable.

- [ ] **Step 5.4: Commit**

```bash
git add src/components/invoices/InvoiceDetailPanel.tsx src/app/\(admin\)/admin/invoices/page.tsx
git commit -m "feat: add Send Email button to invoice detail panel"
```

---

## Verification Checklist

- [ ] PDF route still works (download)
- [ ] With RESEND_API_KEY set: Send Email sends to client email, PDF attached
- [ ] Without RESEND_API_KEY: 503 or clear error message
- [ ] Only issued invoices show Send Email button
- [ ] Draft/paid/cancelled invoices do not show Send Email
- [ ] Client without email: 400 with clear message

---

## Optional Enhancements (Out of Scope)

- Add `sent_at` column to invoices for audit trail
- Bulk "Email selected invoices" from list view
- "Email on issue" checkbox when issuing
- React Email templates for richer design
- CC admin or BCC for records

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2025-03-23-resend-invoice-email.md`. Two execution options:

1. **Subagent-Driven (recommended)** – Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** – Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
