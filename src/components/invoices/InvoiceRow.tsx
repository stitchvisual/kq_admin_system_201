'use client';

import React, { useState } from 'react';
import {
  Download,
  Send,
  CheckCircle,
  MoreHorizontal,
  Eye,
  XCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';
import InvoiceStatusBadge, { type InvoiceStatus } from './InvoiceStatusBadge';

interface InvoiceRowProps {
  invoice: InvoiceWithClient;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  onCancel?: () => void;
  pdfLoading: boolean;
  actionLoading: boolean;
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

export function InvoiceRow({
  invoice,
  selected,
  onSelect,
  onClick,
  onIssue,
  onMarkPaid,
  onDownload,
  onCancel,
  pdfLoading,
  actionLoading,
}: InvoiceRowProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const overdue = isOverdue(invoice);
  const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
  const item_count = invoice.items?.length ?? 0;

  return (
    <div
      className={cn(
        'grid grid-cols-[40px_120px_1fr_100px_100px_120px_100px_140px] gap-4 px-4 py-[0.85rem]',
        'border-b border-primary/80 items-center transition-all cursor-pointer',
        'hover:bg-primary/5'
      )}
      style={{ background: selected ? 'hsl(130 13% 50% / 0.05)' : undefined }}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 cursor-pointer accent-primary"
      />
      
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {invoice.invoice_number}
        </span>
        {item_count > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {item_count} item{item_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground truncate">
          {invoice.client.name}
        </span>
        {invoice.client.ndis_number && (
          <span className="text-[10px] text-muted-foreground/70">
            NDIS: {invoice.client.ndis_number}
          </span>
        )}
      </div>
      
      <span className="text-[13px] text-muted-foreground">
        {formatDate(invoice.invoice_date)}
      </span>
      
      <span
        className={cn(
          'text-[13px] flex items-center gap-1',
          overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
        )}
      >
        {overdue && <Clock size={11} />}
        {formatDate(invoice.due_date)}
      </span>
      
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(invoice.total)}
      </span>
      
      <div>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          issuedAt={invoice.issued_at ?? undefined}
          size="sm"
        />
      </div>
      
      <div
        className="flex items-center justify-end gap-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {invoice.status === 'draft' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIssue();
            }}
            disabled={actionLoading}
            className="h-7 px-3 rounded-md bg-sky-600 text-white text-[11.5px] font-semibold flex items-center gap-1 hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            <Send size={13} /> Issue
          </button>
        )}
        
        {invoice.status === 'issued' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid();
            }}
            disabled={actionLoading}
            className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            title="Mark as Paid"
          >
            {actionLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle size={13} />
            )}
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          disabled={!!pdfLoading}
          className="w-7 h-7 rounded-md border border-primary bg-transparent flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          title="Download PDF"
        >
          {pdfLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOverflow(!showOverflow);
          }}
          className="w-7 h-7 rounded-md border border-primary bg-transparent flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>

        {showOverflow && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowOverflow(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-card border border-primary rounded-lg shadow-lg z-20 min-w-[140px] overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverflow(false);
                  onClick();
                }}
                className="w-full py-2.5 px-3.5 bg-transparent text-[12.5px] text-foreground/80 text-left flex items-center gap-1.5 hover:bg-muted transition-colors"
              >
                <Eye size={13} /> View Details
              </button>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && onCancel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOverflow(false);
                    onCancel();
                  }}
                  className="w-full py-2.5 px-3.5 bg-transparent text-red-600 text-left flex items-center gap-1.5 hover:bg-muted transition-colors"
                >
                  <XCircle size={13} /> Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface InvoiceRowMobileProps {
  invoice: InvoiceWithClient;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onIssue: () => void;
  onMarkPaid: () => void;
  onDownload: () => void;
  pdfLoading: boolean;
  actionLoading: boolean;
}

export function InvoiceRowMobile({
  invoice,
  selected,
  onSelect,
  onClick,
  onIssue,
  onMarkPaid,
  onDownload,
  pdfLoading,
  actionLoading,
}: InvoiceRowMobileProps) {
  const overdue = isOverdue(invoice);
  
  return (
    <div
      className={cn(
        'rounded-lg border border-primary p-3 mb-2 transition-all cursor-pointer',
        'hover:bg-primary/5 active:bg-primary/10',
        selected && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer accent-primary"
          />
          <span className="font-semibold text-sm">{invoice.invoice_number}</span>
        </div>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          size="sm"
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>{invoice.client.name}</span>
        <span className="font-semibold text-foreground">
          {formatCurrency(invoice.total)}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Due: {formatDate(invoice.due_date)}</span>
        <div className="flex gap-1.5">
          {invoice.status === 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIssue();
              }}
              disabled={actionLoading}
              className="h-6 px-2.5 rounded bg-sky-600 text-white text-[10px] font-semibold flex items-center gap-1"
            >
              <Send size={10} /> Issue
            </button>
          )}
          {invoice.status === 'issued' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkPaid();
              }}
              disabled={actionLoading}
              className="h-6 px-2.5 rounded bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1"
            >
              <CheckCircle size={10} /> Paid
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            disabled={!!pdfLoading}
            className="h-6 px-2 rounded border border-primary text-[10px] font-medium"
          >
            {pdfLoading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceRow;
