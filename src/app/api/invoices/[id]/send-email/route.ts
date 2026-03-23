// src/app/api/invoices/[id]/send-email/route.ts
import { NextRequest } from 'next/server';
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

    if (invoice.status !== 'issued' && invoice.status !== 'paid') {
      return ApiResponse.error('Only issued or paid invoices can be emailed.', 400, 'VALIDATION_ERROR');
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
    });

    if (error) {
      console.error('[Send Invoice Email] Resend error:', error);
      return ApiResponse.error(error.message, 500);
    }

    await invoicesService.stampEmailed(id, data?.id ?? null);

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
