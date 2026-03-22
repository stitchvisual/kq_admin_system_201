// src/lib/invoice-pdf.tsx
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
