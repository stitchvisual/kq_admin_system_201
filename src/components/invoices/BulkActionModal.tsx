'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle, Download, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';
import InvoiceStatusBadge, { type InvoiceStatus } from './InvoiceStatusBadge';

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  invoices: InvoiceWithClient[];
  confirmLabel: string;
  confirmIcon?: React.ReactNode;
  confirmVariant?: 'primary' | 'success' | 'danger';
  onConfirm: () => Promise<void>;
  loading: boolean;
  showDownloadOption?: boolean;
  downloadLabel?: string;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

export function BulkActionModal({
  isOpen,
  onClose,
  title,
  description,
  invoices,
  confirmLabel,
  confirmIcon,
  confirmVariant = 'primary',
  onConfirm,
  loading,
  showDownloadOption = false,
  downloadLabel = 'Download PDFs after',
}: BulkActionModalProps) {
  const [downloadAfter, setDownloadAfter] = useState(false);

  if (!isOpen) return null;

  const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);

  const variantStyles = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const handleConfirm = async () => {
    await onConfirm();
    if (downloadAfter) {
      // Parent handles download logic
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div
        className={cn(
          'relative bg-card border border-primary rounded-xl shadow-xl',
          'w-full max-w-md mx-4 overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
          <h2 className="font-heading text-base font-semibold text-foreground m-0">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg border border-primary bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}

          <div className="mb-4 max-h-[240px] overflow-y-auto rounded-lg border border-primary">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-3 py-2.5 border-b border-primary/50 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <FileText size={14} className="text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {invoice.invoice_number}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {invoice.client.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted border border-primary mb-4">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>

          {showDownloadOption && (
            <label className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors mb-4">
              <input
                type="checkbox"
                checked={downloadAfter}
                onChange={(e) => setDownloadAfter(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Download size={13} />
                {downloadLabel}
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-primary bg-muted/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 rounded-lg border border-[hsl(34_22%_74%)] bg-[hsl(42_26%_92%)] text-sm font-medium text-[hsl(145_15%_28%)] hover:bg-[hsl(42_26%_87%)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50',
              variantStyles[confirmVariant]
            )}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              confirmIcon
            )}
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceWithClient[];
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function BulkIssueModal({
  isOpen,
  onClose,
  invoices,
  onConfirm,
  loading,
}: BulkIssueModalProps) {
  return (
    <BulkActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Issue ${invoices.length} Invoice${invoices.length !== 1 ? 's' : ''}?`}
      description="These draft invoices will be marked as issued and ready for payment."
      invoices={invoices}
      confirmLabel={`Issue ${invoices.length} Invoice${invoices.length !== 1 ? 's' : ''}`}
      confirmIcon={<Send size={14} />}
      confirmVariant="primary"
      onConfirm={onConfirm}
      loading={loading}
      showDownloadOption
      downloadLabel="Download PDFs after issuing"
    />
  );
}

interface BulkMarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceWithClient[];
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function BulkMarkPaidModal({
  isOpen,
  onClose,
  invoices,
  onConfirm,
  loading,
}: BulkMarkPaidModalProps) {
  return (
    <BulkActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mark ${invoices.length} Invoice${invoices.length !== 1 ? 's' : ''} as Paid?`}
      description="These invoices will be marked as paid and recorded in your accounts."
      invoices={invoices}
      confirmLabel={`Mark ${invoices.length} as Paid`}
      confirmIcon={<CheckCircle size={14} />}
      confirmVariant="success"
      onConfirm={onConfirm}
      loading={loading}
    />
  );
}

export default BulkActionModal;
