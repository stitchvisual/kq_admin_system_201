'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Client } from '@/db/schema/clients';
import {
  SheetHandle,
  PanelHeader,
  PanelFooter,
  SectionLabel,
  PrimaryBtn,
  DangerBtn,
} from '@/components/panels';
import InvoiceStatusBadge, { type InvoiceStatus } from '@/components/invoices/InvoiceStatusBadge';

/* ─── Types ─────────────────────────────────────────────────────────────── */

type RateCode = { code: string; name: string; price: string } | null;
type RateCodes = {
  weekday: RateCode;
  saturday: RateCode;
  sunday: RateCode;
};

type RecentAppointment = {
  id: string;
  starts_at: Date | string;
  ends_at: Date | string;
  status: string;
  invoiced: boolean;
  is_group: boolean;
};

/** Invoice summary from client detail API (clients.repository.getClientDetail) */
type RecentInvoice = {
  id: string;
  invoice_number: string;
  /** Total in dollars (from DB numeric column; Drizzle returns string) */
  total: string | number;
  status: string;
  invoice_date: Date | null;
};

interface ClientDetailPanelProps {
  client: Client;
  rateCodes: RateCodes;
  recentAppointments: RecentAppointment[];
  invoices: RecentInvoice[];
  outstandingBalance: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(num);
}

/* ─── ClientHeroCard ─────────────────────────────────────────────────────── */

function ClientHeroCard({ client }: { client: Client }) {
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl p-4 border',
        'bg-[rgba(122,156,126,0.10)] border-[rgba(122,156,126,0.25)]',
        'animate-in fade-in-0 zoom-in-[0.98] duration-200'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full bg-primary flex-shrink-0',
          'flex items-center justify-center',
          'text-[13px] font-medium text-primary-foreground'
        )}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] font-semibold text-foreground truncate">
          {client.name}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {client.ndis_number ? `NDIS ${client.ndis_number}` : 'No NDIS number set'}
        </p>
      </div>
    </div>
  );
}

/* ─── BalanceChip ────────────────────────────────────────────────────────── */

function BalanceChip({ outstandingBalance }: { outstandingBalance: number }) {
  const allClear = outstandingBalance === 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2.5 border',
        allClear
          ? 'bg-[rgba(90,138,96,0.08)] border-[rgba(90,138,96,0.2)]'
          : 'bg-[rgba(182,148,112,0.10)] border-[rgba(182,148,112,0.25)]'
      )}
    >
      <span className="text-[11px] text-muted-foreground">Outstanding balance</span>
      <span
        className={cn(
          'font-heading text-[14px] font-semibold',
          allClear ? 'text-[#3a5a3e]' : 'text-[#8a5a2a]'
        )}
      >
        {allClear ? 'All paid up' : formatCurrency(outstandingBalance / 100)}
      </span>
    </div>
  );
}

/* ─── RateCodesSection ───────────────────────────────────────────────────── */

function RateCodesSection({ rateCodes }: { rateCodes: RateCodes }) {
  const days = [
    { label: 'Weekday', rate: rateCodes.weekday },
    { label: 'Saturday', rate: rateCodes.saturday },
    { label: 'Sunday', rate: rateCodes.sunday },
  ];

  return (
    <div>
      <SectionLabel>Rate codes</SectionLabel>
      <div className="divide-y divide-primary/50">
        {days.map(({ label, rate }) => (
          <div key={label} className="flex items-center justify-between py-[6px]">
            <span className="text-[12px] text-muted-foreground">{label}</span>
            {rate ? (
              <div className="flex items-center gap-2 min-w-0">
                <span
                  title={rate.code}
                  className="font-mono text-[10px] text-foreground/60 bg-muted px-1.5 py-0.5 rounded truncate min-w-0 flex-1"
                >
                  {rate.code.length > 12 ? rate.code.slice(0, 12) + '…' : rate.code}
                </span>
                <span className="text-[12px] font-medium text-foreground flex-shrink-0">${rate.price}/hr</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-[6px] h-[6px] rounded-full bg-[hsl(36_65%_56%)] flex-shrink-0"
                  aria-hidden
                />
                <span className="text-[11px] font-medium text-[hsl(25_60%_40%)]">Not set</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SessionStatusBadge ─────────────────────────────────────────────────── */

function SessionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'rgba(90,138,96,0.12)', text: '#3a5a3e', label: 'Completed' },
    confirmed: { bg: 'rgba(120,149,170,0.12)', text: '#2d4a5c', label: 'Confirmed' },
    pending: { bg: 'rgba(182,148,112,0.14)', text: '#6b4d2f', label: 'Pending' },
    cancelled: { bg: 'rgba(168,140,158,0.14)', text: '#6b3a5c', label: 'Cancelled' },
  };
  const c = config[status] ?? { bg: 'rgba(120,149,170,0.12)', text: '#2d4a5c', label: status };

  return (
    <span
      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

/* ─── RecentSessionsSection ──────────────────────────────────────────────── */

function RecentSessionsSection({ appointments }: { appointments: RecentAppointment[] }) {
  if (appointments.length === 0) return null;

  return (
    <div>
      <SectionLabel>Recent sessions</SectionLabel>
      <div className="divide-y divide-primary/50">
        {appointments.slice(0, 5).map((appt, i) => {
          const date = new Date(appt.starts_at);
          const dateStr = date.toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          });

          return (
            <div
              key={appt.id}
              className={cn(
                'flex items-center justify-between py-[6px]',
                'animate-in fade-in-0 slide-in-from-right-2 duration-200'
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-[12px] font-medium text-foreground min-w-0">{dateStr}</span>
              <div className="flex items-center gap-1.5">
                <SessionStatusBadge status={appt.status} />
                {appt.status === 'completed' &&
                  (appt.invoiced ? (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(172,163,118,0.18)] text-[#7a6a30]"
                    >
                      Invoiced
                    </span>
                  ) : (
                    <span className="text-[10px] text-[hsl(25_60%_40%)] font-medium">
                      Not invoiced
                    </span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── InvoicesSection ────────────────────────────────────────────────────── */

function InvoicesSection({ invoices }: { invoices: RecentInvoice[] }) {
  if (invoices.length === 0) return null;

  return (
    <div>
      <SectionLabel>Invoices</SectionLabel>
      <div className="divide-y divide-primary/50">
        {invoices.slice(0, 5).map((inv, i) => (
          <div
            key={inv.id}
            className={cn(
              'flex items-center justify-between py-[6px]',
              'animate-in fade-in-0 slide-in-from-right-2 duration-200'
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="font-mono text-[11px] font-medium text-foreground">
              {inv.invoice_number}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-foreground">
                {formatCurrency(parseFloat(String(inv.total)))}
              </span>
              <InvoiceStatusBadge status={inv.status as InvoiceStatus} size="sm" showIcon={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Panel ──────────────────────────────────────────────────────────────── */

export function ClientDetailPanel({
  client,
  rateCodes,
  recentAppointments,
  invoices,
  outstandingBalance,
  onClose,
  onEdit,
  onDelete,
}: ClientDetailPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-card overflow-hidden">
      <SheetHandle className="md:hidden" />

      <div className="h-[3px] w-full bg-primary flex-shrink-0" aria-hidden />

      <PanelHeader
        showAccentBar={false}
        breadcrumb="Clients"
        title="Client details"
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        <ClientHeroCard client={client} />
        <div className="animate-in fade-in-0 duration-300 delay-100 space-y-4">
          <BalanceChip outstandingBalance={outstandingBalance} />
          <RateCodesSection rateCodes={rateCodes} />
          <RecentSessionsSection appointments={recentAppointments} />
          <InvoicesSection invoices={invoices} />
        </div>
        <div className="h-2" />
      </div>

      <PanelFooter>
        <div className="flex gap-2">
          <PrimaryBtn type="button" onClick={onEdit} className="flex-1">
            <Pencil size={13} />
            Edit client
          </PrimaryBtn>
          <DangerBtn type="button" onClick={onDelete} className="flex-1 h-11 md:h-10">
            <Trash2 size={13} />
            Delete
          </DangerBtn>
        </div>
      </PanelFooter>
    </div>
  );
}
