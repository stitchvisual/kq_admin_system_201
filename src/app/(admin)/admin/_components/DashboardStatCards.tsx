'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { colors, shadows, typography } from '@/styles/botanical';

interface StatCardsProps {
  todayCount: number;
  todayCompleted: number;
  todayRemaining: number;
  weekBooked: number;
  weekCompleted: number;
  weekRemaining: number;
  uninvoicedCount: number;
  outstandingAmount: number;
  outstandingCount: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100);
}

export function DashboardStatCards({
  todayCount,
  todayCompleted,
  todayRemaining,
  weekBooked,
  weekCompleted,
  weekRemaining,
  uninvoicedCount,
  outstandingAmount,
  outstandingCount,
}: StatCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Today */}
      <button
        onClick={() => {
          const scheduleSection = document.getElementById('today-schedule');
          scheduleSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.8), ${shadows.hover}`;
          el.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = statCardBase.boxShadow as string;
          el.style.transform = '';
        }}
        style={{
          ...statCardBase,
          background: 'rgba(120,149,170,0.13)',
          border: '1px solid rgba(120,149,170,0.28)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...labelStyle, color: '#2d4a5c' }}>Today</span>
          <Calendar size={18} style={{ color: '#7895aa', opacity: 0.8 }} />
        </div>
        <div>
          <div style={valueStyle}>{todayCount}</div>
          <div style={subtextStyle}>
            {todayRemaining > 0 ? `${todayCompleted} done, ${todayRemaining} to go` : 'All done today'}
          </div>
        </div>
      </button>

      {/* This Week */}
      <Link href="/admin/appointments" style={{ textDecoration: 'none' }}>
        <div
          className="card-week-hover"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.8), ${shadows.hover}`;
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = statCardBase.boxShadow as string;
            el.style.transform = '';
          }}
          style={{
            ...statCardBase,
            background: 'rgba(130,160,145,0.13)',
            border: '1px solid rgba(130,160,145,0.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...labelStyle, color: '#3a5a45' }}>This Week</span>
            <TrendingUp size={18} style={{ color: '#82a091', opacity: 0.8 }} />
          </div>
          <div>
            <div style={valueStyle}>{weekBooked}</div>
            <div style={subtextStyle}>
              {weekRemaining > 0 ? `${weekCompleted} done, ${weekRemaining} remaining` : 'Week complete'}
            </div>
          </div>
        </div>
      </Link>

      {/* Uninvoiced */}
      <Link href="/admin/invoices/generate" style={{ textDecoration: 'none' }}>
        <div
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.8), ${shadows.hover}`;
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = uninvoicedCount > 0
              ? `inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 2px rgba(182,148,112,0.18), ${shadows.subtle}`
              : statCardBase.boxShadow as string;
            el.style.transform = '';
          }}
          style={{
            ...statCardBase,
            background: uninvoicedCount > 0 ? 'rgba(182,148,112,0.14)' : 'rgba(182,148,112,0.10)',
            border: uninvoicedCount > 0 ? '1px solid rgba(182,148,112,0.45)' : '1px solid rgba(182,148,112,0.28)',
            boxShadow: uninvoicedCount > 0
              ? `inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 2px rgba(182,148,112,0.18), ${shadows.subtle}`
              : statCardBase.boxShadow as string,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...labelStyle, color: '#6b4d2f' }}>Uninvoiced</span>
            <FileText size={18} style={{ color: '#b69470', opacity: 0.8 }} />
          </div>
          <div>
            <div style={valueStyle}>{uninvoicedCount}</div>
            <div style={subtextStyle}>
              {uninvoicedCount > 0 ? 'Ready to bill →' : 'All caught up'}
            </div>
          </div>
        </div>
      </Link>

      {/* Outstanding */}
      <Link href="/admin/invoices" style={{ textDecoration: 'none' }}>
        <div
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.8), ${shadows.hover}`;
            el.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.boxShadow = outstandingAmount > 0
              ? `inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 2px rgba(120,149,170,0.18), ${shadows.subtle}`
              : statCardBase.boxShadow as string;
            el.style.transform = '';
          }}
          style={{
            ...statCardBase,
            background: outstandingAmount > 0 ? 'rgba(120,149,170,0.14)' : 'rgba(120,149,170,0.10)',
            border: outstandingAmount > 0 ? '1px solid rgba(120,149,170,0.45)' : '1px solid rgba(120,149,170,0.28)',
            boxShadow: outstandingAmount > 0
              ? `inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 2px rgba(120,149,170,0.18), ${shadows.subtle}`
              : statCardBase.boxShadow as string,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...labelStyle, color: '#2d4a5c' }}>Outstanding</span>
            <DollarSign size={18} style={{ color: '#7895aa', opacity: 0.8 }} />
          </div>
          <div>
            <div style={valueStyle}>{formatCurrency(outstandingAmount)}</div>
            <div style={subtextStyle}>
              {outstandingCount > 0 ? `${outstandingCount} ${outstandingCount === 1 ? 'invoice' : 'invoices'} →` : 'All paid'}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

const statCardBase: React.CSSProperties = {
  padding: '1.1rem 1.25rem',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  transition: 'box-shadow 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)',
  textDecoration: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), ${shadows.subtle}`,
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  opacity: 0.85,
};

const valueStyle: React.CSSProperties = {
  fontFamily: typography.heading,
  fontSize: '1.65rem',
  fontWeight: 700,
  color: colors.heading,
  marginBottom: '0.2rem',
  lineHeight: 1.15,
};

const subtextStyle: React.CSSProperties = {
  fontSize: '0.74rem',
  color: colors.secondary,
  fontWeight: 500,
};