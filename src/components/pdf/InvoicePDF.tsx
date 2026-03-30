import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';

// Business details from environment variables
const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'KQ Collective';
const BUSINESS_ABN = process.env.NEXT_PUBLIC_BUSINESS_ABN || '00 000 000 000';
const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'contact@kqcollective.com.au';
const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Australia';
const BUSINESS_BANK_NAME = process.env.NEXT_PUBLIC_BUSINESS_BANK_NAME || '';
const BUSINESS_BSB = process.env.NEXT_PUBLIC_BUSINESS_BSB || '';
const BUSINESS_ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_ACCOUNT_NUMBER || '';
const BUSINESS_ACCOUNT_NAME = process.env.NEXT_PUBLIC_BUSINESS_ACCOUNT_NAME || '';
const NDIS_REGISTRATION = process.env.NEXT_PUBLIC_NDIS_REGISTRATION_NUMBER || '';

// Design tokens — Stitch Tokens system
const tokens = {
  color: {
    // Text colors from Stitch Tokens (converted to hex)
    text: '#1e1a17',              // primary - warm black
    textSecondary: '#6b5f52',      // secondary - mid-tone
    textMuted: '#9a8e82',          // tertiary - stone
    textCaption: '#c4876c',          // brand-muted - terracotta
    border: 'rgba(139, 74, 50, 0.12)',  // default border at 12%
    borderStrong: 'rgba(30, 26, 23, 0.15)',  // strong border at 15%
    bgMuted: '#f4f0e8',           // subtle - parchment 100
    bgPage: '#faf8f4',              // base - parchment 50
    bgBrand: '#8b4a32',             // primary - terracotta 500
    bgBrandLight: '#a35a3f',         // hover - terracotta 400
    bgBrandMuted: '#ece7dc',          // brand-muted background
    bgSage: '#e8ede6',              // sage-subtle accent
  },
  // Type scale — matching Stitch Tokens
  font: {
    caption: 8,    // Footer, smallest
    sm: 9,         // Labels, meta, table cells
    base: 10,      // Body default
    md: 11,        // Emphasised body
    lg: 12,        // H3 — card titles, category headers
    xl: 14,        // H2 — section titles
    '2xl': 18,     // H1 — client name, invoice number
    '3xl': 22,     // Display — business name
    '4xl': 28,     // Hero — INVOICE
  },
  fontWeight: {
    normal: 400,   // Regular
    medium: 500,    // Medium - buttons, labels
    semibold: 600,  // Semibold - strong emphasis
    bold: 700,      // Bold - headings
  },
  // 4px grid — matching Stitch Tokens
  space: {
    xs: 4,   // 1 step
    sm: 8,   // 2 steps
    md: 12,  // 3 steps
    lg: 16,  // 4 steps
    xl: 24,  // 6 steps
    '2xl': 32,  // 8 steps
    '3xl': 48,  // 12 steps
  },
  radius: 8,  // md - cards, panels
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: tokens.font.base,
    fontFamily: 'Helvetica',
    backgroundColor: tokens.color.bgPage,
  },
  // —— Hero / Header ——
  header: {
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.color.text,
    marginBottom: tokens.space.xs,
    letterSpacing: -0.5,
  },
  businessDetails: {
    fontSize: 9,
    color: tokens.color.textMuted,
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.color.text,
    textAlign: 'right',
    marginBottom: tokens.space.xs,
    letterSpacing: -0.5,
  },
  invoiceNumber: {
    fontSize: tokens.font.xl,
    color: tokens.color.textSecondary,
    textAlign: 'right',
    fontWeight: tokens.fontWeight.medium,
  },
  // —— H2 Section titles ——
  sectionTitle: {
    fontSize: tokens.font.lg,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.text,
    marginBottom: tokens.space.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.space['2xl'],
    marginBottom: tokens.space.xl,
  },
  column: {
    flex: 1,
  },
  metaBlock: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingVertical: 1,
  },
  metaLabel: {
    fontSize: tokens.font.sm,
    color: tokens.color.textMuted,
    fontWeight: tokens.fontWeight.normal,
  },
  metaValue: {
    fontSize: tokens.font.base,
    color: tokens.color.text,
    fontWeight: tokens.fontWeight.medium,
  },
  // —— H1 within cards (client name) ——
  clientCard: {
    backgroundColor: tokens.color.bgMuted,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius,
    padding: tokens.space.md,
    marginTop: tokens.space.xs,
  },
  clientName: {
    fontSize: tokens.font.xl,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.text,
    marginBottom: tokens.space.sm,
  },
  clientDetail: {
    fontSize: tokens.font.sm,
    color: tokens.color.textMuted,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  servicePeriod: {
    backgroundColor: tokens.color.bgMuted,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius,
    padding: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  // —— Tables ——
  categoryBlock: {
    marginBottom: tokens.space.md,
  },
  categoryHeader: {
    fontSize: tokens.font.base,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.textSecondary,
    backgroundColor: tokens.color.bgMuted,
    border: `1px solid ${tokens.color.border}`,
    borderBottomWidth: 0,
    borderTopLeftRadius: tokens.radius,
    borderTopRightRadius: tokens.radius,
    padding: `${tokens.space.xs}px ${tokens.space.md}px`,
    marginBottom: 0,
    marginTop: tokens.space.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: tokens.color.bgMuted,
    borderLeft: `1px solid ${tokens.color.border}`,
    borderRight: `1px solid ${tokens.color.border}`,
    borderBottom: `1px solid ${tokens.color.borderStrong}`,
    paddingVertical: tokens.space.xs,
    paddingHorizontal: tokens.space.md,
  },
  tableHeaderCell: {
    fontSize: tokens.font.sm,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: `1px solid ${tokens.color.border}`,
    borderRight: `1px solid ${tokens.color.border}`,
    borderBottom: `1px solid ${tokens.color.border}`,
    paddingVertical: tokens.space.sm,
    paddingHorizontal: tokens.space.md,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: tokens.color.bgPage,
  },
  tableRowLast: {
    borderBottomLeftRadius: tokens.radius,
    borderBottomRightRadius: tokens.radius,
  },
  tableCell: {
    fontSize: tokens.font.sm,
    color: tokens.color.textSecondary,
  },
  colDescription: {
    flex: 3,
    paddingRight: tokens.space.md,
  },
  colCode: {
    flex: 0.8,
    textAlign: 'center',
  },
  colQuantity: {
    flex: 0.8,
    textAlign: 'right',
  },
  colRate: {
    flex: 0.9,
    textAlign: 'right',
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
    fontWeight: tokens.fontWeight.medium,
  },
  // —— Totals ——
  totalSection: {
    flexDirection: 'column',
    alignSelf: 'flex-end',
    marginTop: tokens.space.md,
    paddingTop: tokens.space.md,
    borderTop: `2px solid ${tokens.color.borderStrong}`,
    width: 260,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.xs,
  },
  totalLabel: {
    fontSize: tokens.font.base,
    color: tokens.color.textMuted,
    fontWeight: tokens.fontWeight.normal,
  },
  totalValue: {
    fontSize: tokens.font.base,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.text,
    textAlign: 'right',
    minWidth: 90,
  },
  totalLabelGrand: {
    fontSize: tokens.font.base,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.color.text,
  },
  totalValueGrand: {
    fontSize: tokens.font.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.color.text,
    textAlign: 'right',
    minWidth: 90,
  },
  grandTotal: {
    borderTop: `1px solid ${tokens.color.border}`,
    paddingTop: tokens.space.xs,
    marginTop: tokens.space.xs,
  },
  // —— Cards (Notes, Payment) ——
  notes: {
    backgroundColor: tokens.color.bgMuted,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  cardTitle: {
    fontSize: tokens.font.base,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.color.text,
    marginBottom: tokens.space.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: tokens.font.sm,
    color: tokens.color.textSecondary,
    lineHeight: 1.4,
  },
  paymentDetails: {
    backgroundColor: tokens.color.bgMuted,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: tokens.space.xs,
  },
  paymentLabel: {
    fontSize: tokens.font.sm,
    color: tokens.color.textMuted,
    width: 100,
    fontWeight: tokens.fontWeight.normal,
  },
  paymentText: {
    fontSize: tokens.font.sm,
    color: tokens.color.text,
    fontWeight: tokens.fontWeight.medium,
    flex: 1,
  },
  // —— Footer ——
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 40,
    right: 40,
    borderTop: `1px solid ${tokens.color.border}`,
    paddingTop: tokens.space.md,
  },
  footerText: {
    fontSize: tokens.font.caption,
    color: tokens.color.textCaption,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 1.3,
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithClient;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const items = invoice.items || [];
  
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Group items by support category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.support_category || 'Other Services';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.quantity) * parseFloat(item.unit_price);
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{BUSINESS_NAME}</Text>
            <Text style={styles.businessDetails}>
              ABN: {BUSINESS_ABN}{'\n'}
              {NDIS_REGISTRATION && `NDIS Registration: ${NDIS_REGISTRATION}\n`}
              {BUSINESS_EMAIL}{'\n'}
              {BUSINESS_ADDRESS}
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <View style={styles.clientCard}>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              {invoice.client.ndis_number && (
                <Text style={styles.clientDetail}>
                  NDIS: {invoice.client.ndis_number}
                </Text>
              )}
              {invoice.client.address && (
                <Text style={styles.clientDetail}>
                  {invoice.client.address}
                </Text>
              )}
              {invoice.client.suburb && (
                <Text style={styles.clientDetail}>
                  {invoice.client.suburb}
                </Text>
              )}
              {invoice.client.email && (
                <Text style={styles.clientDetail}>
                  {invoice.client.email}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Invoice Date</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.invoice_date)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.due_date)}</Text>
              </View>
              {invoice.issued_at && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Date Issued</Text>
                  <Text style={styles.metaValue}>{formatDate(invoice.issued_at)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Service Period */}
        {invoice.service_period_start || invoice.service_period_end ? (
          <View style={styles.servicePeriod}>
            <Text style={styles.sectionTitle}>Service Period</Text>
            <Text style={styles.metaValue}>
              {formatDate(invoice.service_period_start)} — {formatDate(invoice.service_period_end)}
            </Text>
          </View>
        ) : null}

        {/* Line Items */}
        {Object.entries(groupedItems).map(([category, categoryItems], groupIndex) => (
          <View key={`${category}-${groupIndex}`} style={styles.categoryBlock}>
            <Text style={styles.categoryHeader}>{category}</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colCode]}>Code</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Hours</Text>
              <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>

            {/* Table Rows */}
            {categoryItems.map((item, index) => {
              const isLastRow = index === categoryItems.length - 1;
              const isAltRow = index % 2 !== 0; // Alternate every other row
              
              return (
                <View
                  key={item.id || index}
                  style={
                    isLastRow
                      ? [
                          styles.tableRow,
                          styles.tableRowLast,
                          ...(isAltRow ? [styles.tableRowAlt] : []),
                        ]
                      : [styles.tableRow, ...(isAltRow ? [styles.tableRowAlt] : [])]
                  }
                >
                  <Text style={[styles.tableCell, styles.colDescription]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.tableCell, styles.colCode]}>
                    {item.ndis_item_code || '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQuantity]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableCell, styles.colRate]}>
                    {formatCurrency(item.unit_price)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colAmount]}>
                    {formatCurrency(parseFloat(item.quantity) * parseFloat(item.unit_price))}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST:</Text>
            <Text style={styles.totalValue}>N/A — GST Free</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabelGrand}>Total:</Text>
            <Text style={styles.totalValueGrand}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.cardText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Payment Details */}
        {BUSINESS_BSB && BUSINESS_ACCOUNT_NUMBER && (
          <View style={styles.paymentDetails}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            {BUSINESS_ACCOUNT_NAME && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Account Name:</Text>
                <Text style={styles.paymentText}>{BUSINESS_ACCOUNT_NAME}</Text>
              </View>
            )}
            {BUSINESS_BANK_NAME && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Bank:</Text>
                <Text style={styles.paymentText}>{BUSINESS_BANK_NAME}</Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>BSB:</Text>
              <Text style={styles.paymentText}>{BUSINESS_BSB}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Account:</Text>
              <Text style={styles.paymentText}>{BUSINESS_ACCOUNT_NUMBER}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Payment is due by {formatDate(invoice.due_date)}. Please include invoice number {invoice.invoice_number} with your payment.
          </Text>
          <Text style={styles.footerText}>
            For queries regarding this invoice, contact {BUSINESS_EMAIL}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}