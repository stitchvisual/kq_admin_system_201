/**
 * PDF editing utilities using pdf-lib.
 * Use this for modifying existing PDFs, merging, form filling, etc.
 *
 * For generating PDFs from React components (e.g. invoices), continue using
 * @react-pdf/renderer with InvoicePDF.
 */

import {
  PDFDocument,
  rgb,
  StandardFonts,
} from 'pdf-lib';

/**
 * Load an existing PDF from a buffer
 */
export async function loadPdf(buffer: Buffer): Promise<PDFDocument> {
  return PDFDocument.load(buffer);
}

/**
 * Create a new blank PDF
 */
export async function createPdf(): Promise<PDFDocument> {
  return PDFDocument.create();
}

/**
 * Merge multiple PDF buffers into a single PDF
 */
export async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save());
}

/**
 * Add a watermark to an existing PDF
 */
export async function addWatermark(
  pdfBuffer: Buffer,
  watermarkText: string,
  options?: { opacity?: number; fontSize?: number; color?: [number, number, number] }
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const pages = pdf.getPages();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const opacity = options?.opacity ?? 0.2;
  const fontSize = options?.fontSize ?? 48;
  const color = options?.color ?? [0.7, 0.7, 0.7] as [number, number, number];

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 2 - (watermarkText.length * fontSize * 0.3) / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(color[0], color[1], color[2]),
      opacity,
    });
  }

  return Buffer.from(await pdf.save());
}

/**
 * Add text to a specific page of a PDF
 */
export async function addTextToPage(
  pdfBuffer: Buffer,
  pageIndex: number,
  text: string,
  options?: { x?: number; y?: number; fontSize?: number }
): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const page = pdf.getPage(pageIndex);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const x = options?.x ?? 50;
  const y = options?.y ?? height - 50;
  const fontSize = options?.fontSize ?? 12;

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return Buffer.from(await pdf.save());
}

/**
 * Extract specific pages from a PDF
 */
export async function extractPages(pdfBuffer: Buffer, pageIndices: number[]): Promise<Buffer> {
  const sourcePdf = await PDFDocument.load(pdfBuffer);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, pageIndices);

  pages.forEach((page) => newPdf.addPage(page));

  return Buffer.from(await newPdf.save());
}
