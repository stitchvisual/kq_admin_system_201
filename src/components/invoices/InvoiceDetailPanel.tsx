'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Download, XCircle, Loader2, Mail, MailCheck, Users } from 'lucide-react';
import { slideInRight, fadeUp, staggerContainer } from '@/lib/motion/variants';
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'rounded-xl p-5 border',
        'bg-gradient-to-br from-[var(--color-semantic-brand-primary)]/8 to-[var(--color-semantic-brand-primary)]/4',
        'border-[var(--color-semantic-brand-primary)]/30 shadow-premium-glow'
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
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-[var(--radius-sm)]',
            'bg-[var(--status-overdue-bg)] text-[var(--status-overdue-text)]',
            'text-[11px] font-medium'
          )}
        >
          <span className="relative flex h-[6px] w-[6px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-overdue-text)] opacity-60" />
            <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-[var(--status-overdue-text)]" />
          </span>
          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue — due {formatDate(invoice.due_date)}
        </motion.div>
      )}
    </motion.div>
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
          valueClassName={overdue ? 'text-[var(--color-semantic-brand-primary)] font-medium' : undefined}
        />
        {invoice.issued_at && <MetaRow label="Issued" value={formatDate(invoice.issued_at)} />}
        {invoice.paid_at && <MetaRow label="Paid" value={formatDate(invoice.paid_at)} />}
        {emailedAt && (
          <div className="flex justify-between items-center py-[5px]">
            <span className="text-[12px] text-muted-foreground">Last emailed</span>
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <MailCheck size={11} className="text-[var(--color-semantic-accent-sage)] flex-shrink-0" />
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="rounded-lg border border-[var(--color-semantic-border-default)] overflow-hidden shadow-soft"
      >
        {items.map((item, index) => {
          const lineTotal = parseFloat(String(item.quantity)) * parseFloat(String(item.unit_price));
          const isTravel = item.description.toLowerCase().includes('travel');
          const isGroupShare = item.description.includes('Group session');
          const qty = parseFloat(String(item.quantity));
          const unitHr = parseFloat(String(item.unit_price));

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + (index * 0.04), duration: 0.25 }}
              className={cn(
                'border-b border-[var(--color-semantic-border-default)] last:border-b-0',
                'transition-colors duration-200',
                isTravel && 'bg-[var(--color-semantic-accent-sage-subtle)]/30'
              )}
            >
              <div className="flex items-start justify-between gap-2 px-4 py-3 text-[12px]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    {isGroupShare && !isTravel && (
                      <Users
                        size={13}
                        className="text-[var(--color-semantic-accent-sage)]/80 flex-shrink-0 mt-0.5"
                        aria-hidden
                      />
                    )}
                    <p
                      className={cn(
                        'text-[var(--color-semantic-text-primary)] leading-snug font-medium',
                        isGroupShare ? 'text-[11px]' : 'text-[12px]'
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                  {!isTravel && item.ndis_item_code && (
                    <p
                      className={cn(
                        'text-[10px] text-[var(--color-semantic-text-tertiary)] font-mono mt-1',
                        isGroupShare && 'ml-[18px]'
                      )}
                    >
                      NDIS item code: {item.ndis_item_code}
                    </p>
                  )}
                </div>

                {!isTravel && (
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-[var(--color-semantic-text-secondary)] text-[11px] whitespace-nowrap">
                      {qty.toFixed(1)} h × {formatCurrency(unitHr)}/h
                    </p>
                    <p className="font-semibold text-[var(--color-semantic-text-primary)] text-[12px] whitespace-nowrap">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>
                )}

                {isTravel && (
                  <span className="font-semibold text-[var(--color-semantic-text-primary)] whitespace-nowrap self-center">
                    {formatCurrency(lineTotal)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + (items.length * 0.04), duration: 0.3 }}
          className="flex items-center justify-between px-4 py-3 bg-[var(--color-semantic-background-subtle)] border-t border-[var(--color-semantic-border-strong)]"
        >
          <span className="text-[12px] text-[var(--color-semantic-text-secondary)] font-medium">Total</span>
          <span className="font-heading text-[16px] font-bold text-[var(--color-semantic-text-primary)]">
            {formatCurrency(total)}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── NotesSection ───────────────────────────────────────────────────────── */

function NotesSection({ notes }: { notes: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="rounded-lg bg-[var(--color-semantic-background-muted)] border border-[var(--color-semantic-border-default)] p-4 shadow-soft"
    >
      <SectionLabel>Notes</SectionLabel>
      <p className="text-[12px] text-[var(--color-semantic-text-secondary)] leading-relaxed">{notes}</p>
    </motion.div>
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
          'px-4 shrink-0',
          hasBeenSent &&
            'border-[var(--color-semantic-accent-sage)] text-[var(--color-semantic-accent-sage)]/70 hover:bg-[var(--color-semantic-accent-sage-subtle)] hover:border-[var(--color-semantic-accent-sage)]/90'
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
    <motion.div
      className="flex flex-col h-full min-h-0 bg-card overflow-hidden"
      variants={slideInRight}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SheetHandle className="md:hidden" />

      <div className="h-[3px] w-full bg-[var(--panel-accent-invoice)] flex-shrink-0" aria-hidden />

      <PanelHeader
        showAccentBar={false}
        breadcrumb="Invoices"
        title="Invoice details"
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05 }}
        >
          <HeroCard invoice={invoice} overdue={!!overdue} daysOverdue={daysOverdue} />
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <DatesSection invoice={invoice} overdue={!!overdue} />
          </motion.div>

          {invoice.items && invoice.items.length > 0 && (
            <motion.div variants={fadeUp}>
              <LineItemsSection items={invoice.items} total={String(invoice.total)} />
            </motion.div>
          )}

          {notesTrimmed && (
            <motion.div variants={fadeUp}>
              <NotesSection notes={notesTrimmed} />
            </motion.div>
          )}
        </motion.div>
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
    </motion.div>
  );
}

export default InvoiceDetailPanel;
