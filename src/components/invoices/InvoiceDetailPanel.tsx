'use client';

import React from 'react';
import { Send, CheckCircle, Download, XCircle, Loader2, Mail, MailCheck } from 'lucide-react';
import {
  SheetHandle,
  PanelHeader,
  PanelFooter,
  SectionLabel,
  PrimaryBtn,
  SecondaryBtn,
  DangerBtn,
} from '@/components/panels';
import { cn } from '@/lib/utils';
import type { InvoiceItem } from '@/db/schema/invoice_items';
import type { InvoiceWithClient } from '@/repositories/invoices.repository';
import InvoiceStatusBadge, { type InvoiceStatus } from './InvoiceStatusBadge';

interface InvoiceDetailPanelProps {
  invoice: InvoiceWithClient;
  onClose: () => void;
  onIssue?: () => void;
  onMarkPaid?: () => void;
  onCancel?: () => void;
  onDownload: () => void;
  onSendEmail?: () => void;
  actionLoading: boolean;
  pdfLoading: boolean;
  emailLoading?: boolean;
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

function formatDateTime(date: Date | string | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

/* ─── HeroCard ─────────────────────────────────────────────────────────── */

function HeroCard({
  invoice,
  overdue,
  daysOverdue,
}: {
  invoice: InvoiceWithClient;
  overdue: boolean;
  daysOverdue: number;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 border',
        'bg-[rgba(196,168,130,0.10)] border-[rgba(196,168,130,0.28)]',
        'animate-in fade-in-0 zoom-in-[0.98] duration-200'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-heading text-[15px] font-semibold text-foreground">
          {invoice.invoice_number}
        </span>
        <InvoiceStatusBadge
          status={invoice.status as InvoiceStatus}
          dueDate={invoice.due_date ?? undefined}
          size="sm"
        />
      </div>

      <p className="text-[12px] text-muted-foreground mb-2">{invoice.client.name}</p>

      <p className="font-heading text-[26px] font-semibold text-foreground leading-none mb-1">
        {formatCurrency(invoice.total)}
      </p>

      {invoice.service_period_start && invoice.service_period_end && (
        <p className="text-[11px] text-muted-foreground">
          {formatDate(invoice.service_period_start)} – {formatDate(invoice.service_period_end)}
        </p>
      )}

      {overdue && invoice.due_date && (
        <div
          className={cn(
            'flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-md',
            'bg-destructive/10 text-destructive/80',
            'text-[11px] font-medium'
          )}
        >
          <span className="relative flex h-[6px] w-[6px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-destructive/80" />
          </span>
          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue — due {formatDate(invoice.due_date)}
        </div>
      )}
    </div>
  );
}

/* ─── DatesSection ─────────────────────────────────────────────────────── */

function MetaRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center py-[5px]">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className={cn('text-[12px] font-medium text-foreground', valueClassName)}>{value}</span>
    </div>
  );
}

function DatesSection({ invoice, overdue }: { invoice: InvoiceWithClient; overdue: boolean }) {
  const emailedAt = invoice.emailed_at;
  return (
    <div>
      <SectionLabel>Dates</SectionLabel>
      <div className="space-y-0 divide-y divide-primary/50">
        <MetaRow
          label="Due date"
          value={formatDate(invoice.due_date)}
          valueClassName={overdue ? 'text-destructive font-medium' : undefined}
        />
        {invoice.issued_at && <MetaRow label="Issued" value={formatDate(invoice.issued_at)} />}
        {invoice.paid_at && <MetaRow label="Paid" value={formatDate(invoice.paid_at)} />}
        {emailedAt && (
          <div className="flex justify-between items-center py-[5px]">
            <span className="text-[12px] text-muted-foreground">Last emailed</span>
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <MailCheck size={11} className="text-[hsl(130_13%_45%)] flex-shrink-0" />
              {formatDateTime(emailedAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── LineItemsSection ───────────────────────────────────────────────────── */

function LineItemsSection({ items, total }: { items: InvoiceItem[]; total: string }) {
  return (
    <div>
      <SectionLabel>Sessions</SectionLabel>
      <div className="rounded-lg border border-primary overflow-hidden">
        {items.map((item) => {
          const lineTotal = parseFloat(String(item.quantity)) * parseFloat(String(item.unit_price));
          const isTravel = item.description.toLowerCase().includes('travel');

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between px-3 py-[7px]',
                'text-[12px] border-b border-primary/60 last:border-b-0',
                isTravel && 'bg-soft-cream/40'
              )}
            >
              <span className="text-foreground flex-1 min-w-0 truncate pr-2">{item.description}</span>

              {!isTravel && (
                <span className="text-muted-foreground text-[11px] mr-3 whitespace-nowrap">
                  {parseFloat(String(item.quantity)).toFixed(1)} hrs
                </span>
              )}

              <span className="font-medium text-foreground whitespace-nowrap">
                {formatCurrency(lineTotal)}
              </span>
            </div>
          );
        })}

        <div className="flex items-center justify-between px-3 py-2 bg-soft-cream/60 border-t border-primary">
          <span className="text-[12px] text-muted-foreground">Total</span>
          <span className="font-heading text-[15px] font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── NotesSection ───────────────────────────────────────────────────────── */

function NotesSection({ notes }: { notes: string }) {
  return (
    <div className="rounded-lg bg-soft-cream border border-primary p-3">
      <SectionLabel>Notes</SectionLabel>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{notes}</p>
    </div>
  );
}

/* ─── SendEmailButton ────────────────────────────────────────────────────── */

function SendEmailButton({
  emailedAt,
  loading,
  onClick,
}: {
  emailedAt: Date | string | null | undefined;
  loading: boolean;
  onClick: () => void;
}) {
  const hasBeenSent = !!emailedAt;
  return (
    <div className="flex flex-col items-stretch gap-0.5">
      <SecondaryBtn
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          hasBeenSent &&
            'border-[hsl(130_13%_75%)] text-[hsl(130_13%_35%)] hover:bg-[hsl(130_13%_95%)] hover:border-[hsl(130_13%_65%)]'
        )}
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Sending…
          </>
        ) : hasBeenSent ? (
          <>
            <MailCheck size={13} />
            Resend email
          </>
        ) : (
          <>
            <Mail size={13} />
            Send email
          </>
        )}
      </SecondaryBtn>
      {hasBeenSent && emailedAt && !loading && (
        <span className="text-[11px] text-muted-foreground pl-1">
          Sent {formatDateTime(emailedAt)}
        </span>
      )}
    </div>
  );
}

/* ─── ActionButtons ──────────────────────────────────────────────────────── */

function ActionButtons({
  invoice,
  onIssue,
  onMarkPaid,
  onCancel,
  onDownload,
  onSendEmail,
  actionLoading,
  pdfLoading,
  emailLoading,
}: {
  invoice: InvoiceWithClient;
  onIssue?: () => void;
  onMarkPaid?: () => void;
  onCancel?: () => void;
  onDownload: () => void;
  onSendEmail?: () => void;
  actionLoading: boolean;
  pdfLoading: boolean;
  emailLoading?: boolean;
}) {
  const { status } = invoice;

  return (
    <PanelFooter>
      {status === 'draft' && onIssue && (
        <>
          <PrimaryBtn onClick={onIssue} loading={actionLoading} loadingLabel="Issuing…">
            <Send size={14} />
            Issue invoice
          </PrimaryBtn>
          <div className="flex gap-2">
            <SecondaryBtn type="button" onClick={onDownload} disabled={pdfLoading}>
              {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download
            </SecondaryBtn>
            {onCancel && (
              <DangerBtn type="button" onClick={onCancel}>
                <XCircle size={13} />
                Cancel
              </DangerBtn>
            )}
          </div>
        </>
      )}

      {status === 'issued' && onMarkPaid && (
        <>
          <PrimaryBtn onClick={onMarkPaid} loading={actionLoading} loadingLabel="Saving…">
            <CheckCircle size={14} />
            Mark as paid
          </PrimaryBtn>
          <div className="flex gap-2">
            <SecondaryBtn type="button" onClick={onDownload} disabled={pdfLoading}>
              {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download
            </SecondaryBtn>
            {onSendEmail && (
              <SendEmailButton
                emailedAt={invoice.emailed_at}
                loading={!!emailLoading}
                onClick={onSendEmail}
              />
            )}
            {onCancel && (
              <DangerBtn type="button" onClick={onCancel}>
                <XCircle size={13} />
                Cancel
              </DangerBtn>
            )}
          </div>
        </>
      )}

      {status === 'paid' && (
        <div className="flex gap-2 w-full">
          <SecondaryBtn
            type="button"
            onClick={onDownload}
            disabled={pdfLoading}
            className="flex-1"
          >
            {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Download PDF
          </SecondaryBtn>
          {onSendEmail && (
            <SendEmailButton
              emailedAt={invoice.emailed_at}
              loading={!!emailLoading}
              onClick={onSendEmail}
            />
          )}
        </div>
      )}

      {status === 'cancelled' && (
        <SecondaryBtn
          type="button"
          onClick={onDownload}
          disabled={pdfLoading}
          className="w-full flex-none"
        >
          {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Download PDF
        </SecondaryBtn>
      )}
    </PanelFooter>
  );
}

/* ─── Panel ─────────────────────────────────────────────────────────────── */

export function InvoiceDetailPanel({
  invoice,
  onClose,
  onIssue,
  onMarkPaid,
  onCancel,
  onDownload,
  onSendEmail,
  actionLoading,
  pdfLoading,
  emailLoading,
}: InvoiceDetailPanelProps) {
  const overdue = invoice.status === 'issued' && invoice.due_date && new Date(invoice.due_date) < new Date();
  const daysOverdue = overdue && invoice.due_date
    ? Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000)
    : 0;

  const notesTrimmed = invoice.notes?.trim();

  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />

      <div className="h-[3px] w-full bg-[var(--panel-accent-invoice)] flex-shrink-0" aria-hidden />

      <PanelHeader
        showAccentBar={false}
        breadcrumb="Invoices"
        title="Invoice details"
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <HeroCard invoice={invoice} overdue={!!overdue} daysOverdue={daysOverdue} />
        <div className="animate-in fade-in-0 duration-300 delay-100 space-y-4">
          <DatesSection invoice={invoice} overdue={!!overdue} />
          {invoice.items && invoice.items.length > 0 && (
            <LineItemsSection items={invoice.items} total={String(invoice.total)} />
          )}
          {notesTrimmed ? <NotesSection notes={notesTrimmed} /> : null}
        </div>
        <div className="h-2" />
      </div>

      <ActionButtons
        invoice={invoice}
        onIssue={onIssue}
        onMarkPaid={onMarkPaid}
        onCancel={onCancel}
        onDownload={onDownload}
        onSendEmail={onSendEmail}
        actionLoading={actionLoading}
        pdfLoading={pdfLoading}
        emailLoading={emailLoading}
      />
    </div>
  );
}

export default InvoiceDetailPanel;
