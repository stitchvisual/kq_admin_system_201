import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';

// Must be after all imports — pins this route to the Node.js runtime.
// @react-pdf/renderer uses native Node.js modules that webpack cannot bundle.
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const invoice = await invoicesService.getById(id);

    // Serialize to plain object to avoid React error #31 from DB types (Decimal, Date, etc.)
    const plainInvoice = JSON.parse(JSON.stringify(invoice)) as typeof invoice;

    // Generate PDF buffer server-side (returns Node Buffer, compatible with Response)
    const buffer = await renderToBuffer(<InvoicePDF invoice={plainInvoice} />);

    // Safe filename: escape quotes, use RFC 5987 for non-ASCII
    const safeName = String(invoice.invoice_number).replace(/["\\]/g, '');
    const filename = `${safeName}.pdf`;
    const encodedFilename = encodeURIComponent(filename);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    // Log the real error server-side for debugging
    console.error('[PDF Route] Error generating PDF:', error);

    if (error instanceof Error && error.name === 'NotFoundError') {
      return ApiResponse.error(error.message, 404);
    }
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }

    // Return the actual error message (temporarily) so client can surface it
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
