'use client';

import React from 'react';
import {
  X,
  Send,
  CheckCircle,
  Download,
  XCircle,
  Loader2,
  Clock,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';
import InvoiceStatusBadge, { type InvoiceStatus } from './InvoiceStatusBadge';
import InvoiceLineItems from './InvoiceLineItems';

interface InvoiceDetailPanelProps {
  invoice: InvoiceWithClient;
  onClose: () => void;
  onIssue?: () => void;
  onMarkPaid?: () => void;
  onCancel?: () => void;
  onDownload: () => void;
  actionLoading: boolean;
  pdfLoading: boolean;
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

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

function isOverdue(invoice: InvoiceWithClient): boolean {
  if (invoice.status !== 'issued') return false;
  return new Date(invoice.due_date) < new Date();
}

function getDaysOverdue(dueDate: Date | string): number {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function InvoiceDetailPanel({
  invoice,
  onClose,
  onIssue,
  onMarkPaid,
  onCancel,
  onDownload,
  actionLoading,
  pdfLoading,
}: InvoiceDetailPanelProps) {
  const overdue = isOverdue(invoice);
  const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
  const canCancel = invoice.status !== 'paid' && invoice.status !== 'cancelled';
  const hasItems = invoice.items && invoice.items.length > 0;

  return (
    <div className="flex flex-col h-full bg-card border-t-[3px] border-t-[hsl(32,28%,78%)]">
      <PanelHeader invoiceNumber={invoice.invoice_number} onClose={onClose} />
      
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <InvoiceSummaryCard
          invoice={invoice}
          overdue={overdue}
          daysOverdue={daysOverdue}
        />
        
        <InvoiceMetaSection invoice={invoice} overdue={overdue} />
        
        {hasItems && (
          <InvoiceLineItems
            items={invoice.items!}
            total={invoice.total}
            collapsible={true}
            defaultExpanded={true}
            showHeaders={true}
          />
        )}
        
        {invoice.notes && (
          <NotesSection notes={invoice.notes} />
        )}
      </div>
      
      <PanelActions
        invoice={invoice}
        onIssue={onIssue}
        onMarkPaid={onMarkPaid}
        onCancel={onCancel}
        onDownload={onDownload}
        actionLoading={actionLoading}
        pdfLoading={pdfLoading}
        canCancel={canCancel}
      />
    </div>
  );
}

interface PanelHeaderProps {
  invoiceNumber: string;
  onClose: () => void;
}

function PanelHeader({ invoiceNumber, onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary flex-shrink-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase text-muted-foreground tracking-wider">
          Invoices / {invoiceNumber}
        </span>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-base font-semibold text-foreground m-0">
            Invoice Details
          </h2>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg border border-primary bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}

interface InvoiceSummaryCardProps {
  invoice: InvoiceWithClient;
  overdue: boolean;
  daysOverdue: number;
}

function InvoiceSummaryCard({ invoice, overdue, daysOverdue }: InvoiceSummaryCardProps) {
  return (
    <div className="rounded-lg bg-muted border border-primary p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-lg font-bold text-foreground">
          {invoice.invoice_number}
        </span>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          issuedAt={invoice.issued_at ?? undefined}
          size="sm"
        />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <User size={13} className="text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          {invoice.client.name}
        </span>
      </div>
      
      <div className="font-heading text-2xl font-bold text-foreground">
        {formatCurrency(invoice.total)}
      </div>
      
      {overdue && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <Clock size={12} />
          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
        </div>
      )}
    </div>
  );
}

interface InvoiceMetaSectionProps {
  invoice: InvoiceWithClient;
  overdue: boolean;
}

function InvoiceMetaSection({ invoice, overdue }: InvoiceMetaSectionProps) {
  return (
    <div className="space-y-3">
      <InfoRow label="Invoice Date" value={formatDate(invoice.invoice_date)} icon={<Calendar size={12} />} />
      <InfoRow label="Due Date" value={formatDate(invoice.due_date)} highlight={overdue} icon={<Calendar size={12} />} />
      {invoice.issued_at && <InfoRow label="Issued" value={formatDate(invoice.issued_at)} />}
      {invoice.paid_at && <InfoRow label="Paid" value={formatDate(invoice.paid_at)} />}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, highlight = false, icon }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          'text-sm',
          highlight ? 'text-red-600 font-semibold' : 'text-foreground font-medium'
        )}
      >
        {value}
      </span>
    </div>
  );
}

interface NotesSectionProps {
  notes: string;
}

function NotesSection({ notes }: NotesSectionProps) {
  return (
    <div className="rounded-lg bg-muted/50 border border-primary p-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
        Notes
      </span>
      <p className="text-sm text-muted-foreground">{notes}</p>
    </div>
  );
}

interface PanelActionsProps {
  invoice: InvoiceWithClient;
  onIssue?: () => void;
  onMarkPaid?: () => void;
  onCancel?: () => void;
  onDownload: () => void;
  actionLoading: boolean;
  pdfLoading: boolean;
  canCancel: boolean;
}

function PanelActions({
  invoice,
  onIssue,
  onMarkPaid,
  onCancel,
  onDownload,
  actionLoading,
  pdfLoading,
  canCancel,
}: PanelActionsProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-t border-primary bg-muted/30">
      {invoice.status === 'draft' && onIssue && (
        <>
          <button
            onClick={onIssue}
            disabled={actionLoading}
            className="h-10 rounded-lg bg-sky-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <Send size={14} />
                Issue Invoice
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              disabled={pdfLoading}
              className="h-9 flex-1 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {pdfLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              Download
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={actionLoading}
                className="h-9 flex-1 px-3.5 rounded-lg border border-red-500/30 bg-transparent text-red-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <XCircle size={13} />
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {invoice.status === 'issued' && onMarkPaid && (
        <>
          <button
            onClick={onMarkPaid}
            disabled={actionLoading}
            className="h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Mark as Paid
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              disabled={pdfLoading}
              className="h-9 flex-1 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {pdfLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              Download
            </button>
            {canCancel && onCancel && (
              <button
                onClick={onCancel}
                disabled={actionLoading}
                className="h-9 flex-1 px-3.5 rounded-lg border border-red-500/30 bg-transparent text-red-600 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <XCircle size={13} />
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {(invoice.status === 'paid' || invoice.status === 'cancelled') && (
        <button
          onClick={onDownload}
          disabled={pdfLoading}
          className="h-10 px-3.5 rounded-lg border border-primary bg-transparent text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {pdfLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Download size={13} />
          )}
          Download PDF
        </button>
      )}
    </div>
  );
}

export default InvoiceDetailPanel;
