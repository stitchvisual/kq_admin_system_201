'use client';

import { useState } from 'react';
import { Send, CheckCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { colors, radii, typography, shadows } from '@/styles/botanical';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total: string;
  due_date: string;
  client: {
    name: string;
  };
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  onUpdate?: () => void;
}

function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

function isOverdue(invoice: Invoice): boolean {
  if (invoice.status !== 'issued') return false;
  return new Date(invoice.due_date) < new Date();
}

export function RecentInvoices({ invoices, onUpdate }: RecentInvoicesProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const handleIssue = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/issue`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice issued successfully');
        onUpdate?.();
      } else {
        toast.error(data.error?.message ?? 'Failed to issue invoice');
      }
    } catch (error) {
      console.error('Failed to issue invoice:', error);
      toast.error('Failed to issue invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-paid`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice marked as paid');
        onUpdate?.();
      } else {
        toast.error(data.error?.message ?? 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      toast.error('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (invoiceNumber: string, invoiceId: string) => {
    setPdfLoading(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        credentials: 'same-origin',
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('[PDF] Server error:', res.status, body);
        throw new Error(`PDF generation failed (${res.status}): ${body}`);
      }

      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error('PDF is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleIssueAndDownload = async (invoiceNumber: string, invoiceId: string) => {
    await handleIssue(invoiceId);
    // Wait a bit for the issue to complete, then download
    setTimeout(() => handleDownload(invoiceNumber, invoiceId), 500);
  };

  if (invoices.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={sectionHeading}>Recent Invoices</h2>
      
      {/* Table container - matching invoice table style */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.primary}`,
        borderRadius: radii.card,
        overflow: 'hidden',
      }}>
        {/* Desktop table header - matching invoice list grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 100px 90px 140px',
          gap: '1rem',
          padding: '0.75rem 1rem',
          borderBottom: `1px solid ${colors.primary}`,
          background: colors.mutedBg,
          alignItems: 'center',
        }}>
          <span style={headerLabelStyle}>Invoice</span>
          <span style={headerLabelStyle}>Client</span>
          <span style={{ ...headerLabelStyle, textAlign: 'right' }}>Total</span>
          <span style={{ ...headerLabelStyle, textAlign: 'center' }}>Status</span>
          <span style={{ ...headerLabelStyle, textAlign: 'center' }}>Actions</span>
        </div>

        {/* Invoice rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {invoices.map((invoice) => {
            const overdue = isOverdue(invoice);
            const statusColor = overdue
              ? { bg: 'rgba(160,64,64,0.15)', text: '#7a3030', border: 'rgba(160,64,64,0.3)' }
              : invoice.status === 'paid'
              ? { bg: 'rgba(90,138,96,0.15)', text: '#3a5a3e', border: 'rgba(90,138,96,0.3)' }
              : invoice.status === 'issued'
              ? { bg: 'rgba(120,149,170,0.15)', text: '#2d4a5c', border: 'rgba(120,149,170,0.3)' }
              : { bg: 'rgba(182,148,112,0.15)', text: '#6b4d2f', border: 'rgba(182,148,112,0.3)' };

            return (
              <div
                key={invoice.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 100px 90px 140px',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  borderBottom: `1px solid ${colors.subtle}`,
                  alignItems: 'center',
                  transition: 'all 120ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Invoice number */}
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: colors.heading,
                }}>
                  {invoice.invoice_number}
                </span>

                {/* Client name */}
                <span style={{
                  fontSize: '0.85rem',
                  color: colors.body,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {invoice.client.name}
                </span>

                {/* Total */}
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: colors.heading,
                  textAlign: 'right',
                }}>
                  {formatCurrency(invoice.total)}
                </span>

                {/* Status badge */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: 99,
                      background: statusColor.bg,
                      color: statusColor.text,
                      border: `1px solid ${statusColor.border}`,
                      textTransform: 'capitalize',
                      minWidth: 70,
                      justifyContent: 'center',
                    }}
                  >
                    {overdue && <AlertTriangle size={11} />}
                    {overdue ? 'overdue' : invoice.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {invoice.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIssueAndDownload(invoice.invoice_number, invoice.id);
                      }}
                      disabled={actionLoading === invoice.id || pdfLoading === invoice.id}
                      style={{ ...actionButton, whiteSpace: 'nowrap' }}
                    >
                      {actionLoading === invoice.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <Send size={13} />
                          <Download size={13} />
                        </>
                      )}
                      Issue
                    </button>
                  )}

                  {(invoice.status === 'issued' || overdue) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkPaid(invoice.id);
                      }}
                      disabled={actionLoading === invoice.id}
                      style={{
                        ...actionButton,
                        background: overdue ? '#a04040' : 'hsl(130 13% 50%)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {actionLoading === invoice.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily: typography.heading,
  fontSize: '0.85rem',
  fontWeight: typography.weights.heading,
  letterSpacing: typography.letterSpacing.label,
  textTransform: 'uppercase',
  color: colors.muted,
  marginBottom: '0.75rem',
};

const headerLabelStyle: React.CSSProperties = {
  fontSize: typography.sizes.label,
  fontWeight: typography.weights.bold,
  letterSpacing: typography.letterSpacing.label,
  textTransform: 'uppercase',
  color: colors.muted,
};

const actionButton: React.CSSProperties = {
  height: 32,
  padding: '0 12px',
  borderRadius: radii.button,
  border: 'none',
  background: '#0369a1',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  boxShadow: shadows.subtle,
};