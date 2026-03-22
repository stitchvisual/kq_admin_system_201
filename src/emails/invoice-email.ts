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
