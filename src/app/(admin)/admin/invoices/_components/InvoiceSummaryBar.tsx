'use client';

import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { colors, shadows, typography } from '@/styles/botanical';

interface SummaryStats {
  outstanding: { count: number; total: number };
  overdue: { count: number; total: number };
  paid_this_month: { count: number; total: number };
  draft: { count: number; total: number };
}

interface InvoiceSummaryBarProps {
  stats: SummaryStats | null;
  loading?: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
}

export function InvoiceSummaryBar({ stats, loading }: InvoiceSummaryBarProps) {
  if (loading || !stats) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 10,
              background: colors.mutedBg,
              border: `1px solid ${colors.primary}`,
              minHeight: 88,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Outstanding */}
      <StatCard
        icon={<TrendingUp size={18} />}
        label="Outstanding"
        amount={stats.outstanding.total}
        count={stats.outstanding.count}
        color="#7895aa"
        bg="rgba(120,149,170,0.12)"
        borderColor="rgba(120,149,170,0.3)"
      />

      {/* Overdue */}
      <StatCard
        icon={<AlertTriangle size={18} />}
        label="Overdue"
        amount={stats.overdue.total}
        count={stats.overdue.count}
        color="#a04040"
        bg="rgba(160,64,64,0.12)"
        borderColor="rgba(160,64,64,0.3)"
        highlight={stats.overdue.count > 0}
      />

      {/* Paid This Month */}
      <StatCard
        icon={<CheckCircle size={18} />}
        label="Paid This Month"
        amount={stats.paid_this_month.total}
        count={stats.paid_this_month.count}
        color="#5a8a60"
        bg="rgba(90,138,96,0.12)"
        borderColor="rgba(90,138,96,0.3)"
      />

      {/* Draft */}
      <StatCard
        icon={<FileText size={18} />}
        label="Draft"
        amount={stats.draft.total}
        count={stats.draft.count}
        color="#b69470"
        bg="rgba(182,148,112,0.12)"
        borderColor="rgba(182,148,112,0.3)"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  amount,
  count,
  color,
  bg,
  borderColor,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  count: number;
  color: string;
  bg: string;
  borderColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: 10,
        background: bg,
        border: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
        boxShadow: highlight ? `0 0 0 2px ${color}40` : 'none',
        transition: 'all 150ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color,
            opacity: 0.9,
          }}
        >
          {label}
        </span>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div>
        <div
          style={{
            fontFamily: typography.heading,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: colors.heading,
            marginBottom: '0.25rem',
          }}
        >
          {formatCurrency(amount)}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: colors.secondary,
            fontWeight: 500,
          }}
        >
          {count} {count === 1 ? 'invoice' : 'invoices'}
        </div>
      </div>
    </div>
  );
}